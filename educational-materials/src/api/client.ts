import { API_BASE_URL } from './config'
import { ACCESS_TOKEN_KEY, USER_STORAGE_KEY } from '../auth/storage'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers)
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const body = init.body
  if (body != null && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  if (res.status === 401) {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    window.dispatchEvent(new CustomEvent('em:auth-expired'))
  }
  return res
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init)
  if (!res.ok) {
    const errBody = (await res.json().catch(() => null)) as { error?: string } | null
    const msg = errBody?.error ?? res.statusText
    throw new ApiError(msg || 'Ошибка запроса', res.status)
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  const text = await res.text()
  if (!text) {
    return undefined as T
  }
  return JSON.parse(text) as T
}

export async function apiVoid(path: string, init: RequestInit = {}): Promise<void> {
  const res = await apiFetch(path, init)
  if (!res.ok) {
    const errBody = (await res.json().catch(() => null)) as { error?: string } | null
    const msg = errBody?.error ?? res.statusText
    throw new ApiError(msg || 'Ошибка запроса', res.status)
  }
}
