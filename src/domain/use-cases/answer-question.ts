import { Answer } from "../entities/answer"
import { Slug } from "../entities/value-objects/slug"

interface AnswerQuestionUseCaseRequest {
  instructorId: string
  questionId: string
  content: string
  slug: Slug
}

export class AnswerQuestionUseCase {
  execute({ instructorId, questionId, content, slug }: AnswerQuestionUseCaseRequest) {
    const answer = new Answer({
      content,
      authorId: instructorId,
      questionId,
      // slug: Slug
    })

    return answer
  }
}