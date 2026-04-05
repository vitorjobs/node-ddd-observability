import { getLogger } from '../../infra/logger'

export class QuestionQueryService {
  async findById(questionId: string) {
    const logger = getLogger({
      module: 'application.question-query-service',
    })

    logger.debug({
      event_name: 'question.lookup.started',
      question_id: questionId,
    }, 'question.lookup.started')

    const question = {
      questionId,
      title: 'Pergunta de exemplo',
    }

    logger.info({
      event_name: 'question.lookup.completed',
      question_id: question.questionId,
      title_length: question.title.length,
    }, 'question.lookup.completed')

    return question
  }
}

export const questionQueryService = new QuestionQueryService()
