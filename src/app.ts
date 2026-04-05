import Fastify from 'fastify'
import { registerRoutes } from './http/routes'
import {
  generateRequestId,
  logger,
  registerFastifyLogging,
} from './infra/logger'
import { registerHttpTelemetry } from './telemetry/application-telemetry'

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
    disableRequestLogging: true,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'request_id',
    genReqId: generateRequestId,
  })

  await registerFastifyLogging(app)
  registerHttpTelemetry(app)
  await registerRoutes(app)

  return app
}
