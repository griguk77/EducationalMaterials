import { useEffect, useState } from 'react'
import { ApiError } from '../../api/client'
import { fetchMaterialsForTopic } from '../../api/materialsApi'
import { fetchTopics } from '../../api/topicsApi'
import type { MaterialDto, TopicDto } from '../../api/types'
import { materialTypeLabelRu } from '../../utils/materialTypeLabels'

type Row = MaterialDto & { topicName: string }

export function StudentMaterialsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const topics = await fetchTopics()
        const nested = await Promise.all(
          topics.map(async (t: TopicDto) => {
            const mats = await fetchMaterialsForTopic(t.id)
            return mats.map((m) => ({ ...m, topicName: t.name }))
          }),
        )
        if (!cancelled) setRows(nested.flat())
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError
              ? e.message
              : 'Не удалось загрузить материалы.',
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
        Учебные материалы
      </h1>
      <p className="mt-2 text-slate-600">
        Материалы по темам (статья, видео и др.). Список с сервера.
      </p>

      {loading ? (
        <p className="mt-8 text-slate-500">Загрузка…</p>
      ) : error ? (
        <p className="mt-8 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-slate-500">Материалов пока нет.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-slate-500">{m.topicName}</p>
              <p className="font-medium text-slate-900">{m.title}</p>
              <p className="text-xs text-slate-500">
                {materialTypeLabelRu(m.type)} · уровень {m.difficultyLevel}
              </p>
              <a
                href={m.link}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-emerald-700 hover:underline"
              >
                Перейти
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
