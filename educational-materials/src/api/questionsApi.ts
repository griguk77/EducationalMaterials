import { apiJson, apiVoid } from './client'
import type { AnswerType, QuestionTeacherDto } from './types'

export async function fetchQuestionsForTopic(topicId: string): Promise<QuestionTeacherDto[]> {
  return apiJson<QuestionTeacherDto[]>(`/api/topics/${topicId}/questions`)
}

export async function createQuestion(
  topicId: string,
  payload: {
    text: string
    optionsJson: string | null
    correctAnswer: string
    difficulty: number
    answerType: AnswerType
    normativeTimeMs: number | null
    orderIndex: number | null
  },
): Promise<QuestionTeacherDto> {
  return apiJson<QuestionTeacherDto>(`/api/topics/${topicId}/questions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateQuestion(
  topicId: string,
  questionId: string,
  payload: {
    text: string
    optionsJson: string | null
    correctAnswer: string
    difficulty: number
    answerType: AnswerType
    normativeTimeMs: number | null
    orderIndex: number | null
  },
): Promise<QuestionTeacherDto> {
  return apiJson<QuestionTeacherDto>(
    `/api/topics/${topicId}/questions/${questionId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  )
}

export async function deleteQuestion(topicId: string, questionId: string): Promise<void> {
  await apiVoid(`/api/topics/${topicId}/questions/${questionId}`, {
    method: 'DELETE',
  })
}
