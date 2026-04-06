import { apiJson, apiVoid } from './client'
import type { MaterialDto, MaterialType } from './types'

export async function fetchMaterialsForTopic(topicId: string): Promise<MaterialDto[]> {
  return apiJson<MaterialDto[]>(`/api/topics/${topicId}/materials`)
}

export async function createMaterial(
  topicId: string,
  payload: {
    title: string
    link: string
    type: MaterialType
    difficultyLevel: number
  },
): Promise<MaterialDto> {
  return apiJson<MaterialDto>(`/api/topics/${topicId}/materials`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateMaterial(
  topicId: string,
  materialId: string,
  payload: {
    title: string
    link: string
    type: MaterialType
    difficultyLevel: number
  },
): Promise<MaterialDto> {
  return apiJson<MaterialDto>(
    `/api/topics/${topicId}/materials/${materialId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  )
}

export async function deleteMaterial(topicId: string, materialId: string): Promise<void> {
  await apiVoid(`/api/topics/${topicId}/materials/${materialId}`, {
    method: 'DELETE',
  })
}
