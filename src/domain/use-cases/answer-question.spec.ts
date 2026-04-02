// import { expect, test } from "vitest"
// import { AnswerQuestionUseCase } from "./answer-question"

// test('create an answer', () => {
//   const answerQuestion = new AnswerQuestionUseCase()

//   const answer = answerQuestion.execute({
//     questionId: '1',
//     instructorId: '1',
//     content: 'Nova resposta',
//   })

//   expect(answer.content).toEqual('Nova resposta')
// })

// import { describe, expect, test } from "vitest"
// import { AnswerQuestionUseCase } from "./answer-question"
// import { Answer } from "../entities/answer"

// describe('AnswerQuestionUseCase', () => {
//   test('should create an answer with correct data', () => {
//     const sut = new AnswerQuestionUseCase()

//     const answer = sut.execute({
//       questionId: 'question-1',
//       instructorId: 'instructor-1',
//       content: 'Nova resposta',
//     })

//     expect(answer.content).toBe('Nova resposta')
//     expect(answer.authorId).toBe('instructor-1')
//     expect(answer.questionId).toBe('question-1')
//   })

//   test('should generate an id if not provided', () => {
//     const sut = new AnswerQuestionUseCase()

//     const answer = sut.execute({
//       questionId: 'question-1',
//       instructorId: 'instructor-1',
//       content: 'Nova resposta',
//     })

//     expect(answer.id).toBeDefined()
//     expect(typeof answer.id).toBe('string')
//   })

//   test('should return an Answer instance', () => {
//     const sut = new AnswerQuestionUseCase()

//     const answer = sut.execute({
//       questionId: 'question-1',
//       instructorId: 'instructor-1',
//       content: 'Nova resposta',
//     })

//     expect(answer).toBeInstanceOf(Answer)
//   })
// })



import { describe, expect, test } from "vitest"
import { AnswerQuestionUseCase } from "./answer-question"
import { Answer } from "../entities/answer"


function makeAnswer(override?: Partial<{
  questionId: string
  instructorId: string
  content: string
}>) {
  const sut = new AnswerQuestionUseCase()

  return sut.execute({
    questionId: 'question-1',
    instructorId: 'instructor-1',
    content: 'Nova resposta',
    ...override,
  })
}

describe('AnswerQuestionUseCase', () => {
  test('should create an answer with correct data', () => {
    const sut = new AnswerQuestionUseCase()

    const answer = makeAnswer()

    expect(answer.content).toBe('Nova resposta')
    expect(answer.authorId).toBe('instructor-1')
    expect(answer.questionId).toBe('question-1')
  })

  test('should generate an id if not provided', () => {
    const sut = new AnswerQuestionUseCase()

    const answer = sut.execute({
      questionId: 'question-1',
      instructorId: 'instructor-1',
      content: 'Nova resposta',
    })

    expect(answer.id).toBeDefined()
    expect(typeof answer.id).toBe('string')
  })

  test('should return an Answer instance', () => {
    const sut = new AnswerQuestionUseCase()

    const answer = makeAnswer()

    expect(answer).toBeInstanceOf(Answer)
  })
})
