import './telemetry/instrumentation'
import { buildApp } from './app'
import { logger, registerProcessErrorHandlers } from './infra/logger'

async function bootstrap() {
  const app = await buildApp()
  const port = Number(process.env.PORT ?? 3333)

  registerProcessErrorHandlers(app)

  await app.listen({
    port,
    host: '0.0.0.0',
  })

  logger.info({
    port,
    otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'default',
    serviceName: process.env.OTEL_SERVICE_NAME ?? 'rocketseat-ddd-api',
    event_name: 'server.started',
  }, 'server.started')
}

bootstrap().catch((error) => {
  logger.fatal({
    err: error,
    event_name: 'server.bootstrap.failed',
  }, 'server.bootstrap.failed')
  process.exit(1)
})
