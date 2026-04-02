import { metrics, SpanStatusCode, trace, type Attributes, type Span } from '@opentelemetry/api'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

// Padrao para novas rotas e operacoes:
// 1. Declare `config.telemetry` na rota com operation/resource/action.
// 2. Envolva a execucao principal com `runObservedOperation()`.
// 3. Use `spanAttributes` e `logAttributes` apenas para contexto de investigacao.

const requestStartedAtSymbol = Symbol('requestStartedAt')
const ignoredRoutes = new Set(['/health'])

const meter = metrics.getMeter('designsoftddd.api')
const tracer = trace.getTracer('designsoftddd.api')

const httpServerRequests = meter.createCounter('designsoftddd.http.server.requests', {
  description: 'Total de requisicoes HTTP processadas pela API',
})

const httpServerDuration = meter.createHistogram('designsoftddd.http.server.duration', {
  description: 'Duracao das requisicoes HTTP processadas pela API',
  unit: 's',
})

const operationExecutions = meter.createCounter('designsoftddd.use_case.executions', {
  description: 'Total de execucoes de operacoes instrumentadas pela aplicacao',
})

const operationDuration = meter.createHistogram('designsoftddd.use_case.duration', {
  description: 'Duracao das operacoes instrumentadas pela aplicacao',
  unit: 's',
})

type InstrumentedRequest = FastifyRequest & {
  [requestStartedAtSymbol]?: bigint
}

type RouteTelemetryConfig = Partial<OperationTelemetryMetadata> & {
  useCase?: string
}

interface RouteConfigWithTelemetry {
  telemetry?: RouteTelemetryConfig
}

export interface OperationTelemetryMetadata {
  operation: string
  resource: string
  action: string
  endpointGroup?: string
}

export interface ObservedOperationOptions extends OperationTelemetryMetadata {
  spanName?: string
  spanAttributes?: Attributes
  logAttributes?: Record<string, unknown>
}

function getRoute(request: FastifyRequest) {
  return request.routeOptions.url ?? request.url
}

function getStatusClass(statusCode: number) {
  return `${Math.floor(statusCode / 100)}xx`
}

function inferAction(method: string) {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'create'
    case 'PUT':
    case 'PATCH':
      return 'update'
    case 'DELETE':
      return 'delete'
    default:
      return 'read'
  }
}

function inferEndpointGroup(route: string) {
  const [segment = 'root'] = route.split('/').filter(Boolean)

  return segment.replace(/[^a-zA-Z0-9_-]/g, '_')
}

function normalizeOperationTelemetry(
  request: FastifyRequest,
  telemetry?: RouteTelemetryConfig,
): OperationTelemetryMetadata {
  const route = getRoute(request)

  return {
    operation: telemetry?.operation ?? telemetry?.useCase ?? `${request.method.toLowerCase()}.${route}`,
    resource: telemetry?.resource ?? inferEndpointGroup(route),
    action: telemetry?.action ?? inferAction(request.method),
    endpointGroup: telemetry?.endpointGroup ?? inferEndpointGroup(route),
  }
}

function buildSharedAttributes(
  request: FastifyRequest,
  metadata: OperationTelemetryMetadata,
): Attributes {
  return {
    'http.method': request.method,
    'http.route': getRoute(request),
    'app.operation': metadata.operation,
    'app.use_case': metadata.operation,
    'app.resource': metadata.resource,
    'app.action': metadata.action,
    'app.endpoint_group': metadata.endpointGroup ?? inferEndpointGroup(getRoute(request)),
  }
}

function getElapsedSeconds(startedAt: bigint) {
  return Number(process.hrtime.bigint() - startedAt) / 1_000_000_000
}

export function getRequestTelemetryMetadata(request: FastifyRequest): OperationTelemetryMetadata {
  const config = (request.routeOptions.config ?? {}) as RouteConfigWithTelemetry

  return normalizeOperationTelemetry(request, config.telemetry)
}

export function annotateActiveRequestSpan(request: FastifyRequest) {
  const span = trace.getActiveSpan()

  if (!span) {
    return
  }

  span.setAttributes(buildSharedAttributes(request, getRequestTelemetryMetadata(request)))
}

export function recordHttpServerRequestMetrics(
  request: FastifyRequest,
  reply: FastifyReply,
  durationInSeconds: number,
) {
  const attributes = {
    ...buildSharedAttributes(request, getRequestTelemetryMetadata(request)),
    'http.status_code': reply.statusCode.toString(),
    'http.status_class': getStatusClass(reply.statusCode),
  }

  httpServerRequests.add(1, attributes)
  httpServerDuration.record(durationInSeconds, attributes)
}

export function registerHttpTelemetry(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    ;(request as InstrumentedRequest)[requestStartedAtSymbol] = process.hrtime.bigint()
  })

  app.addHook('preHandler', async (request) => {
    annotateActiveRequestSpan(request)
  })

  app.addHook('onResponse', async (request, reply) => {
    const route = getRoute(request)

    if (ignoredRoutes.has(route)) {
      return
    }

    const startedAt = (request as InstrumentedRequest)[requestStartedAtSymbol]

    if (!startedAt) {
      return
    }

    recordHttpServerRequestMetrics(request, reply, getElapsedSeconds(startedAt))
  })
}

export async function runObservedOperation<T>(
  request: FastifyRequest,
  options: ObservedOperationOptions,
  execute: (span: Span) => Promise<T> | T,
) {
  const route = getRoute(request)
  const sharedAttributes = buildSharedAttributes(request, options)

  return tracer.startActiveSpan(options.spanName ?? options.operation, {
    attributes: {
      ...sharedAttributes,
      ...options.spanAttributes,
    },
  }, async (span) => {
    const startedAt = process.hrtime.bigint()
    let outcome = 'success'

    try {
      const result = await execute(span)

      request.log.info({
        app_operation: options.operation,
        app_use_case: options.operation,
        app_resource: options.resource,
        app_action: options.action,
        app_route: route,
        app_outcome: outcome,
        ...options.logAttributes,
      }, `Operation completed: ${options.operation} [${route}]`)

      return result
    } catch (error) {
      outcome = 'error'

      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      })

      request.log.error({
        app_operation: options.operation,
        app_use_case: options.operation,
        app_resource: options.resource,
        app_action: options.action,
        app_route: route,
        app_outcome: outcome,
        ...options.logAttributes,
      }, `Operation failed: ${options.operation} [${route}]`)

      throw error
    } finally {
      const durationInSeconds = getElapsedSeconds(startedAt)
      const metricAttributes = {
        ...sharedAttributes,
        'app.outcome': outcome,
      }

      span.setAttribute('app.outcome', outcome)
      operationExecutions.add(1, metricAttributes)
      operationDuration.record(durationInSeconds, metricAttributes)
      span.end()
    }
  })
}
