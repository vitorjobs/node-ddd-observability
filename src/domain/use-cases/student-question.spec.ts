import { describe, expect, test } from "vitest"
import { StudentQuestionUseCase } from "./student-question"
import { Student } from "../entities/student"

function makeStudent(override?: Partial<{
  studentId: string
  studentName: string
}>) {
  const sut = new StudentQuestionUseCase()

  return sut.execute({
    studentId: 'student-1',
    studentName: 'John Doe',
    ...override,
  })
}

describe('StudentQuestionUseCase', () => {
  test('should create a student with correct data', () => {
    const result = makeStudent()

    expect(result).toBeInstanceOf(Student)

    if (result instanceof Student) {
      expect(result.id).toBe('student-1')
      expect(result.name).toBe('Vitor Guedes')
    }
  })

  test('should return an error if student ID is empty', () => {
    const result = makeStudent({
      studentId: '',
    })

    expect(result).toBe('Invalid student ID')
  })

  test('should return an error if student ID is undefined string', () => {
    const result = makeStudent({
      studentId: 'undefined',
    })

    expect(result).toBe('Invalid student ID')
  })
})