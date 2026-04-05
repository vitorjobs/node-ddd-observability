import type { FastifyInstance, FastifyRequest } from 'fastify'
import { enterRequestLogContext, getRequestLogContext, setRequestRoute } from './request-context'
import { getCorrelationId, getLogger } from './logger'

const ignoredPaths = new Set(['/health'])

function getRequestPath(request: FastifyRequest) {
  return request.raw.url?.split('?')[0] ?? request.url
}

function getRequestRoute(request: FastifyRequest) {
  return request.routeOptions.url ?? getRequestPath(request)
}

function getElapsedMilliseconds(startedAt: bigint) {
  return Number(process.hrtime.bigint() - startedAt) / 1_000_000
}

function resolveResponseLogLevel(statusCode: number) {
  if (statusCode >= 500) {
    return 'error'
  }

  if (statusCode >= 400) {
    return 'warn'
  }

  return 'info'
}

function shouldIgnoreRequest(path: string) {
  return ignoredPaths.has(path)
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error
  }

  return new Error('Unknown Fastify error', {
    cause: error,
  })
}

function getErrorStatusCode(error: unknown) {
  if (
    typeof error === 'object'
    && error !== null
    && 'statusCode' in error
    && typeof error.statusCode === 'number'
  ) {
    return error.statusCode
  }

  return 500
}

export async function registerFastifyLogging(app: FastifyInstance<any, any, any, any>) {
  app.addHook('onRequest', async (request, reply) => {
    const path = getRequestPath(request)
    const startedAt = process.hrtime.bigint()
    const correlationId = getCorrelationId(request.headers) ?? request.id
    const requestLogger = getLogger({
      request_id: request.id,
      correlation_id: correlationId,
      http_method: request.method,
      http_path: path,
    })

    reply.header('x-request-id', request.id)
    reply.header('x-correlation-id', correlationId)

    enterRequestLogContext({
      logger: requestLogger,
      requestId: request.id,
      correlationId,
      method: request.method,
      path,
      startedAt,
    })

    if (shouldIgnoreRequest(path)) {
      return
    }

    requestLogger.info({
      event_name: 'http.request.received',
    }, 'http.request.received')
  })

  app.addHook('preHandler', async (request) => {
    setRequestRoute(getRequestRoute(request))
  })

  app.addHook('onResponse', async (request, reply) => {
    const path = getRequestPath(request)

    if (shouldIgnoreRequest(path)) {
      return
    }

    const context = getRequestLogContext()
    const requestLogger = context?.logger ?? getLogger({
      request_id: request.id,
      correlation_id: getCorrelationId(request.headers) ?? request.id,
    })

    const durationInMilliseconds = context
      ? getElapsedMilliseconds(context.startedAt)
      : undefined

    const message = 'http.request.completed'
    const level = resolveResponseLogLevel(reply.statusCode)

    requestLogger[level]({
      event_name: message,
      http_method: request.method,
      http_route: getRequestRoute(request),
      http_status_code: reply.statusCode,
      response_time_ms: durationInMilliseconds,
    }, message)
  })

  app.setErrorHandler((error, request, reply) => {
    const normalizedError = normalizeError(error)
    const context = getRequestLogContext()
    const correlationId = context?.correlationId ?? getCorrelationId(request.headers) ?? request.id
    const statusCode = getErrorStatusCode(error)
    const durationInMilliseconds = context
      ? getElapsedMilliseconds(context.startedAt)
      : undefined

    const requestLogger = context?.logger ?? getLogger({
      request_id: request.id,
      correlation_id: correlationId,
      http_method: request.method,
      http_route: getRequestRoute(request),
    })

    requestLogger.error({
      event_name: 'http.request.failed',
      err: normalizedError,
      http_status_code: statusCode,
      response_time_ms: durationInMilliseconds,
    }, 'http.request.failed')

    reply.status(statusCode).send({
      error: statusCode >= 500 ? 'Internal Server Error' : normalizedError.name,
      message: statusCode >= 500 ? 'Internal server error' : normalizedError.message,
      statusCode,
      correlationId,
    })
  })
}
