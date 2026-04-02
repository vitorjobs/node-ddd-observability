import type { FastifyInstance } from 'fastify'
import { registerExampleRoutes } from './example-routes'
import { registerHealthRoutes } from './health-routes'

export async function registerRoutes(app: FastifyInstance) {
  await registerHealthRoutes(app)
  await registerExampleRoutes(app)
}
