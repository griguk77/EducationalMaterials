import { apiJson, apiVoid } from './client'
import type { TopicDto } from './types'

export async function fetchTopics(): Promise<TopicDto[]> {
  return apiJson<TopicDto[]>('/api/topics')
}

export async function createTopic(payload: {
  name: string
  description: string | null
  hLow?: number | null
  hHigh?: number | null
}): Promise<TopicDto> {
  return apiJson<TopicDto>('/api/topics', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateTopic(
  id: string,
  payload: { name: string; description: string | null; hLow: number; hHigh: number },
): Promise<TopicDto> {
  return apiJson<TopicDto>(`/api/topics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteTopic(id: string): Promise<void> {
  await apiVoid(`/api/topics/${id}`, { method: 'DELETE' })
}
