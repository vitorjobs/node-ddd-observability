import type { FastifyInstance } from 'fastify'
import { questionQueryService } from '../../application/services/question-query-service'
import { bindRequestLogContext } from '../../infra/logger'
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

export async function registerExampleRoutes(app: FastifyInstance<any, any, any, any>) {
  app.get('/questions/:id', {
    config: {
      telemetry: sampleQuestionReadOperation,
    },
  }, async (request) => {
    const { id } = request.params as { id: string }
    const userIdHeader = request.headers['x-user-id']
    const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader

    if (userId) {
      bindRequestLogContext({
        user_id: userId,
      })
    }

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
      const question = await questionQueryService.findById(id)

      span.setAttribute('app.resource.name', 'question')
      span.setAttribute('app.resource.id', question.questionId)

      return question
    })
  })
}
