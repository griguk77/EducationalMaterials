import { ACTIVE_TEST_SESSION_STORAGE_KEY } from '../auth/storage'

type Stored = { sessionId: string; topicId?: string }

export function readStoredActiveSessionId(): string | null {
  try {
    const raw = sessionStorage.getItem(ACTIVE_TEST_SESSION_STORAGE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as Stored
    return o.sessionId?.trim() ? o.sessionId : null
  } catch {
    return null
  }
}

export function writeStoredActiveSession(sessionId: string, topicId: number) {
  sessionStorage.setItem(
    ACTIVE_TEST_SESSION_STORAGE_KEY,
    JSON.stringify({ sessionId, topicId: String(topicId) }),
  )
}

export function clearStoredActiveSession() {
  sessionStorage.removeItem(ACTIVE_TEST_SESSION_STORAGE_KEY)
}
