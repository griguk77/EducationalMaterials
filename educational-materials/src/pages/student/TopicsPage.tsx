import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { fetchTopics } from '../../api/topicsApi'
import type { TopicDto } from '../../api/types'

export function TopicsPage() {
  const [topics, setTopics] = useState<TopicDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const list = await fetchTopics()
        if (!cancelled) setTopics(list)
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError
              ? e.message
              : 'Не удалось загрузить темы.',
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
      <h1 className="text-2xl font-semibold text-slate-900">Тесты по темам</h1>
      <p className="mt-2 text-slate-600">
        Тема соответствует «тесту»: после выбора создаётся сессия на сервере.
      </p>

      {loading ? (
        <p className="mt-8 text-slate-500">Загрузка…</p>
      ) : error ? (
        <p className="mt-8 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : topics.length === 0 ? (
        <p className="mt-8 text-slate-500">Тем пока нет.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {topics.map((topic) => (
            <li key={topic.id}>
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <h2 className="font-medium text-slate-900">{topic.name}</h2>
                  <p className="text-sm text-slate-500">
                    {topic.description ?? '—'}
                  </p>
                </div>
                <Link
                  to={`/student/test/${topic.id}`}
                  className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Начать тест
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
