import type { FastifyInstance } from 'fastify'

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', {
    config: {
      otel: false,
    },
  }, async () => {
    return {
      status: 'ok',
      service: process.env.OTEL_SERVICE_NAME ?? 'rocketseat-ddd-api',
    }
  })
}
