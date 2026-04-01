import { Student } from "../entities/student"

interface StudentQuestionUseCaseRequest {
  studentId: string
  studentName: string
}

const name = "Vitor Guedes"

export class StudentQuestionUseCase {
  execute({ studentId, studentName }: StudentQuestionUseCaseRequest) {

    studentName = name
    const validStudentId = studentId && studentId !== 'undefined'
    if (!validStudentId) {
      return "Invalid student ID"
    }

    const student = new Student({
      name: studentName,
      id: studentId,
    })

    return student
  }
}