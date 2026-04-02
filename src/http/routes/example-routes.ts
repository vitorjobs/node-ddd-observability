import type { FastifyInstance } from 'fastify'
import {
  runObservedOperation,
  type OperationTelemetryMetadata,
} from '../../telemetry/application-telemetry'

const sampleQuestionReadOperation: OperationTelemetryMetadata = {
  operation: 'question.read',
  resource: 'question',
  action: 'read',
  endpointGroup: 'questions',
}

export async function registerExampleRoutes(app: FastifyInstance) {
  app.get('/questions/:id', {
    config: {
      telemetry: sampleQuestionReadOperation,
    },
  }, async (request) => {
    const { id } = request.params as { id: string }

    return runObservedOperation(request, {
      ...sampleQuestionReadOperation,
      spanName: 'question.read',
      spanAttributes: {
        'app.resource.name': 'question',
        'app.resource.id': id,
      },
      logAttributes: {
        resource_name: 'question',
        resource_id: id,
      },
    }, async (span) => {
      const question = {
        questionId: id,
        title: 'Pergunta de exemplo',
      }

      span.setAttribute('app.resource.name', 'question')
      span.setAttribute('app.resource.id', question.questionId)

      return question
    })
  })
}
