import type { MaterialType } from '../api/types'

/** Подписи типа материала для отображения в UI (значения API не меняются). */
export function materialTypeLabelRu(t: MaterialType): string {
  switch (t) {
    case 'ARTICLE':
      return 'Статья'
    case 'VIDEO':
      return 'Видео'
    case 'EXTERNAL':
      return 'Внешняя ссылка'
    case 'DOCUMENT':
      return 'Документ'
    default:
      return String(t)
  }
}
