import type { FastifyInstance } from 'fastify'
import { logger } from './logger'

let handlersRegistered = false

function normalizeRejectionReason(reason: unknown) {
  if (reason instanceof Error) {
    return reason
  }

  return new Error('Unhandled promise rejection', {
    cause: reason,
  })
}

function scheduleProcessExit(app?: FastifyInstance<any, any, any, any>) {
  const exitCode = 1

  setTimeout(() => {
    process.exit(exitCode)
  }, 250).unref()

  if (!app) {
    return
  }

  void app.close().catch((error) => {
    logger.error({
      err: error,
      event_name: 'process.shutdown.failed',
    }, 'process.shutdown.failed')
  })
}

export function registerProcessErrorHandlers(app?: FastifyInstance<any, any, any, any>) {
  if (handlersRegistered) {
    return
  }

  handlersRegistered = true

  process.on('uncaughtException', (error) => {
    logger.fatal({
      err: error,
      event_name: 'process.uncaught_exception',
    }, 'process.uncaught_exception')

    scheduleProcessExit(app)
  })

  process.on('unhandledRejection', (reason) => {
    logger.fatal({
      err: normalizeRejectionReason(reason),
      event_name: 'process.unhandled_rejection',
    }, 'process.unhandled_rejection')

    scheduleProcessExit(app)
  })
}
