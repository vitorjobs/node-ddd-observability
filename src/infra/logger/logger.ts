import { randomUUID } from 'node:crypto'
import type { IncomingHttpHeaders, IncomingMessage } from 'node:http'
import pino, { type Logger, type LoggerOptions } from 'pino'
import { bindRequestContext, getRequestLogContext } from './request-context'

const environment = process.env.NODE_ENV ?? 'development'
const serviceName = process.env.OTEL_SERVICE_NAME ?? 'rocketseat-ddd-api'
const serviceNamespace = process.env.OTEL_SERVICE_NAMESPACE ?? 'designsoftddd'
const serviceVersion = process.env.npm_package_version ?? '1.0.0'

const defaultLevelByEnvironment = {
  development: 'debug',
  production: 'info',
  test: 'warn',
} as const

const redactedPaths = [
  'authorization',
  'password',
  'token',
  'refresh_token',
  'access_token',
  'headers.authorization',
  'headers.cookie',
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.token',
  'request.headers.authorization',
  'request.headers.cookie',
  'request.body.password',
  'request.body.token',
  'user.password',
  'user.token',
]

function resolveDefaultLogLevel() {
  if (environment in defaultLevelByEnvironment) {
    return defaultLevelByEnvironment[environment as keyof typeof defaultLevelByEnvironment]
  }

  return 'info'
}

function buildLoggerOptions(): LoggerOptions {
  return {
    level: process.env.LOG_LEVEL ?? process.env.APP_LOG_LEVEL ?? resolveDefaultLogLevel(),
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: redactedPaths,
      censor: '[Redacted]',
    },
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },
    formatters: {
      bindings(bindings) {
        return {
          pid: bindings.pid,
          hostname: bindings.hostname,
          service_name: serviceName,
          service_namespace: serviceNamespace,
          service_version: serviceVersion,
          deployment_environment: environment,
        }
      },
      level(label) {
        return {
          level: label,
        }
      },
    },
  }
}

function buildLogger(): Logger {
  const options = buildLoggerOptions()

  if (environment !== 'development') {
    return pino(options)
  }

  const transport = pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      singleLine: false,
    },
  })

  return pino(options, transport)
}

function getFirstHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export const logger = buildLogger()

export function getLogger(bindings: Record<string, unknown> = {}) {
  const sourceLogger = getRequestLogContext()?.logger ?? logger

  if (Object.keys(bindings).length === 0) {
    return sourceLogger
  }

  return sourceLogger.child(bindings)
}

export function bindRequestLogContext(bindings: Record<string, unknown>) {
  return bindRequestContext(bindings) ?? logger.child(bindings)
}

export function generateRequestId(rawRequest: IncomingMessage) {
  return getFirstHeaderValue(rawRequest.headers['x-request-id']) ?? randomUUID()
}

export function getCorrelationId(headers: IncomingHttpHeaders) {
  return (
    getFirstHeaderValue(headers['x-correlation-id'])
    ?? getFirstHeaderValue(headers['x-request-id'])
  )
}
