import { apiJson } from './client'
import type { AuthResponse } from './types'

export async function loginApi(login: string, password: string): Promise<AuthResponse> {
  return apiJson<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login, password }),
  })
}

export async function registerApi(payload: {
  login: string
  password: string
  name: string
  role: 'STUDENT' | 'TEACHER'
}): Promise<AuthResponse> {
  return apiJson<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
