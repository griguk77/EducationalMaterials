import { API_BASE_URL } from './config'
import { apiJson, apiVoid } from './client'
import type {
  CompleteSessionResponse,
  StartSessionResponse,
  SubmitAnswerResponse,
  TestSessionSummaryDto,
} from './types'

export async function startTestSession(
  topicId: number,
  signal?: AbortSignal,
): Promise<StartSessionResponse> {
  return apiJson<StartSessionResponse>('/api/test-sessions', {
    method: 'POST',
    body: JSON.stringify({ topicId }),
    signal,
  })
}

/**
 * Прерывание сессии без глобальной обработки 401 (токен передаётся явно — на выходе из аккаунта).
 * 204 и 400 «уже завершена» считаем успехом.
 */
export async function abandonSessionWithToken(
  sessionId: string,
  accessToken: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/api/test-sessions/${sessionId}/abandon`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
  if (res.ok || res.status === 400) return
  const errBody = (await res.json().catch(() => null)) as { error?: string } | null
  throw new Error(errBody?.error ?? res.statusText)
}

/** Все незавершённые сессии обучающегося — перед выходом из аккаунта. */
export async function abandonAllUnfinishedWithToken(
  accessToken: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE_URL}/api/student/sessions/abandon-all-unfinished`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
  if (res.ok) return
  const errBody = (await res.json().catch(() => null)) as { error?: string } | null
  throw new Error(errBody?.error ?? res.statusText)
}

export async function submitAnswer(
  sessionId: string,
  payload: {
    questionId: number
    userAnswer: string
    responseTimeMs: number
  },
): Promise<SubmitAnswerResponse> {
  return apiJson<SubmitAnswerResponse>(
    `/api/test-sessions/${sessionId}/answers`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export async function completeSession(sessionId: string): Promise<CompleteSessionResponse> {
  return apiJson<CompleteSessionResponse>(
    `/api/test-sessions/${sessionId}/complete`,
    { method: 'POST' },
  )
}

export async function abandonSession(sessionId: string): Promise<void> {
  await apiVoid(`/api/test-sessions/${sessionId}/abandon`, { method: 'POST' })
}

export async function fetchStudentSessions(): Promise<TestSessionSummaryDto[]> {
  return apiJson<TestSessionSummaryDto[]>('/api/student/sessions')
}

export async function fetchTeacherSessions(): Promise<TestSessionSummaryDto[]> {
  return apiJson<TestSessionSummaryDto[]>('/api/teacher/sessions')
}
