import { useEffect, useState } from 'react'
import { ApiError } from '../../api/client'
import { fetchTeacherSessions } from '../../api/sessionsApi'
import type { TestSessionSummaryDto } from '../../api/types'
import { sessionStatusLabel } from '../../utils/sessionStatus'

export function TeacherStudentResultsPage() {
  const [sessions, setSessions] = useState<TestSessionSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const list = await fetchTeacherSessions()
        if (!cancelled) setSessions(list)
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError
              ? e.message
              : 'Не удалось загрузить результаты.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Результаты учащихся
      </h1>
      <p className="mt-2 text-slate-600">
        Сессии тестирования по всем обучающимся.
      </p>

      {loading ? (
        <p className="mt-8 text-slate-500">Загрузка…</p>
      ) : error ? (
        <p className="mt-8 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Учащийся</th>
                <th className="px-4 py-3 font-medium">Тема</th>
                <th className="px-4 py-3 font-medium">Начало</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">M<sub>C</sub></th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Пока нет сессий.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">{s.userName ?? s.userId ?? '—'}</td>
                    <td className="px-4 py-3">{s.topicName || s.topicId}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {new Date(s.startedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{sessionStatusLabel(s)}</td>
                    <td className="px-4 py-3">
                      {s.masteryScore != null
                        ? s.masteryScore.toFixed(3)
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
