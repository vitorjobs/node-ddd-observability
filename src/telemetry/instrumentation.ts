import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import FastifyOtelInstrumentation from '@fastify/otel'

const isDev = process.env.NODE_ENV !== 'production'
const metricExportInterval = Number(process.env.OTEL_METRIC_EXPORT_INTERVAL ?? 10000)

if (isDev) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO)
}

const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter(),
  exportIntervalMillis: metricExportInterval,
})

export const sdk = new NodeSDK({
  metricReaders: [metricReader],
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-pino': {
        logHook: (_span, record) => {
          record['service.name'] = process.env.OTEL_SERVICE_NAME ?? 'rocketseat-ddd-api'
          record['service.namespace'] = 'designsoftddd'
          record['deployment.environment.name'] = process.env.NODE_ENV ?? 'development'
          record['service.version'] = process.env.npm_package_version ?? '1.0.0'
        },
      },
    }),
    new FastifyOtelInstrumentation({
      registerOnInitialization: true,
      ignorePaths: (options) => options.url === '/health',
    }),
  ],
})

sdk.start()

async function shutdown(signal: NodeJS.Signals) {
  try {
    await sdk.shutdown()

    if (isDev) {
      console.info(`OpenTelemetry SDK encerrado apos ${signal}`)
    }
  } catch (error) {
    console.error('Erro ao encerrar OpenTelemetry', error)
  }
}

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    void shutdown(signal)
  })
}
