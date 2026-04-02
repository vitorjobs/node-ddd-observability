import './telemetry/instrumentation'
import { buildApp } from './app'

async function bootstrap() {
  const app = await buildApp()
  const port = Number(process.env.PORT ?? 3333)

  await app.listen({
    port,
    host: '0.0.0.0',
  })

  app.log.info({
    port,
    otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'default',
    serviceName: process.env.OTEL_SERVICE_NAME ?? 'rocketseat-ddd-api',
  }, 'HTTP server started')
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
