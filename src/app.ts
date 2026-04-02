import Fastify from 'fastify'
import { registerRoutes } from './http/routes'
import { registerHttpTelemetry } from './telemetry/application-telemetry'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.APP_LOG_LEVEL ?? 'info',
    },
  })

  registerHttpTelemetry(app)
  await registerRoutes(app)

  return app
}
