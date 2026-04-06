export type AnswerType = 'SINGLE' | 'MULTIPLE' | 'TEXT'

export type MaterialType = 'ARTICLE' | 'VIDEO' | 'EXTERNAL' | 'DOCUMENT'

export type UserRoleDto = 'student' | 'teacher'

export type AuthResponse = {
  accessToken: string
  user: {
    id: string
    name: string
    role: UserRoleDto
  }
}

export type TopicDto = {
  id: string
  name: string
  description: string | null
  /** Нижний порог M_C для метки «повторить» / «закрепить». */
  hLow: number
  /** Верхний порог M_C для метки «закрепить» / «освоено». */
  hHigh: number
}

export type QuestionOptionDto = {
  id: string
  text: string
}

export type StudentQuestionDto = {
  id: string
  text: string
  answerType: AnswerType
  options: QuestionOptionDto[] | null
  normativeTimeMs: number | null
}

export type StartSessionResponse = {
  sessionId: string
  topicId: string
  question: StudentQuestionDto | null
}

export type SubmitAnswerResponse = {
  nextQuestion: StudentQuestionDto | null
}

export type MaterialDto = {
  id: string
  topicId: string
  title: string
  link: string
  type: MaterialType
  difficultyLevel: number
}

export type CompleteSessionResponse = {
  sessionId: string
  topicId: string
  masteryScore: number
  masteryLabel: string
  recommendations: MaterialDto[]
}

export type TestSessionSummaryDto = {
  id: string
  topicId: string
  topicName: string
  startedAt: string
  finishedAt: string | null
  masteryScore: number | null
  finished: boolean
  userId: string | null
  userName: string | null
}

export type QuestionTeacherDto = {
  id: string
  topicId: string
  text: string
  answerType: AnswerType
  options: QuestionOptionDto[] | null
  correctAnswer: string
  difficulty: number
  normativeTimeMs: number | null
  orderIndex: number
}
