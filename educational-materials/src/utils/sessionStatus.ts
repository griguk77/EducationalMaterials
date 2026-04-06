import type { TestSessionSummaryDto } from '../api/types'

/** Статус попытки для таблиц: в процессе / завершена с баллом / прервана без балла. */
export function sessionStatusLabel(s: TestSessionSummaryDto): string {
  if (!s.finished) return 'В процессе'
  if (s.masteryScore != null) return 'Завершена'
  return 'Незавершена'
}
