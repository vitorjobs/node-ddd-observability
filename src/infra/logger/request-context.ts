import { AsyncLocalStorage } from 'node:async_hooks'
import type { Logger } from 'pino'

export interface RequestLogContext {
  logger: Logger
  requestId: string
  correlationId: string
  method: string
  path: string
  route?: string
  startedAt: bigint
}

const requestLogContext = new AsyncLocalStorage<RequestLogContext>()

export function enterRequestLogContext(context: RequestLogContext) {
  requestLogContext.enterWith(context)
}

export function getRequestLogContext() {
  return requestLogContext.getStore()
}

export function bindRequestContext(bindings: Record<string, unknown>) {
  const context = requestLogContext.getStore()

  if (!context) {
    return undefined
  }

  context.logger = context.logger.child(bindings)

  return context.logger
}

export function setRequestRoute(route: string) {
  const context = requestLogContext.getStore()

  if (!context || context.route === route) {
    return context?.logger
  }

  context.route = route
  context.logger = context.logger.child({
    http_route: route,
  })

  return context.logger
}
