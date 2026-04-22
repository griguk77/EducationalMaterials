import type { AnswerType } from '../api/types'

/** Подпись формата ответа для UI (значения API: SINGLE, MULTIPLE, TEXT). */
export function answerTypeLabelRu(t: AnswerType): string {
  switch (t) {
    case 'SINGLE':
      return 'выбор одного ответа'
    case 'MULTIPLE':
      return 'множественный выбор'
    case 'TEXT':
      return 'ручной ввод ответа'
    default:
      return String(t)
  }
}
