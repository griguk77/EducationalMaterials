import { useEffect, useState } from 'react'
import { ApiError } from '../../api/client'
import type { TopicDto } from '../../api/types'
import { createTopic, deleteTopic, fetchTopics, updateTopic } from '../../api/topicsApi'

/** Совпадают с дефолтами `app.recommendation` на бэкенде; при создании темы можно не менять. */
const DEFAULT_H_LOW = 0.45
const DEFAULT_H_HIGH = 0.75

/** Пороги из API: Jackson мог отдавать `hlow`/`hhigh` вместо camelCase — учитываем варианты имён. */
function topicThresholds(t: TopicDto) {
  const r = t as TopicDto & Record<string, unknown>
  const num = (v: unknown): number | undefined =>
    typeof v === 'number' && Number.isFinite(v) ? v : undefined
  return {
    hLow: num(r.hLow) ?? num(r.h_low) ?? num(r.hlow) ?? DEFAULT_H_LOW,
    hHigh: num(r.hHigh) ?? num(r.h_high) ?? num(r.hhigh) ?? DEFAULT_H_HIGH,
  }
}

export function TeacherTopicsPage() {
  const [topics, setTopics] = useState<TopicDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<TopicDto | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [hLow, setHLow] = useState(String(DEFAULT_H_LOW))
  const [hHigh, setHHigh] = useState(String(DEFAULT_H_HIGH))

  async function reload() {
    const list = await fetchTopics()
    setTopics(list)
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        await reload()
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError ? e.message : 'Не удалось загрузить темы.',
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

  function openCreate() {
    setEditing(null)
    setName('')
    setDescription('')
    setHLow(String(DEFAULT_H_LOW))
    setHHigh(String(DEFAULT_H_HIGH))
    setModal('create')
  }

  function openEdit(t: TopicDto) {
    setEditing(t)
    setName(t.name)
    setDescription(t.description ?? '')
    const th = topicThresholds(t)
    setHLow(String(th.hLow))
    setHHigh(String(th.hHigh))
    setModal('edit')
  }

  function parseThresholds(): { ok: true; low: number; high: number } | { ok: false; message: string } {
    const low = Number(hLow.replace(',', '.'))
    const high = Number(hHigh.replace(',', '.'))
    if (!Number.isFinite(low) || !Number.isFinite(high)) {
      return { ok: false, message: 'Введите числовые пороги: нижний и верхний.' }
    }
    if (low < 0 || low > 1 || high < 0 || high > 1) {
      return { ok: false, message: 'Пороги должны быть в диапазоне от 0 до 1.' }
    }
    if (low >= high) {
      return { ok: false, message: 'Нижний порог должен быть строго меньше верхнего.' }
    }
    return { ok: true, low, high }
  }

  async function handleSave() {
    const th = parseThresholds()
    if (!th.ok) {
      setError(th.message)
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (modal === 'create') {
        await createTopic({
          name: name.trim(),
          description: description.trim() || null,
          hLow: th.low,
          hHigh: th.high,
        })
      } else if (modal === 'edit' && editing) {
        await updateTopic(editing.id, {
          name: name.trim(),
          description: description.trim() || null,
          hLow: th.low,
          hHigh: th.high,
        })
      }
      await reload()
      setModal(null)
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Не удалось сохранить тему.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(t: TopicDto) {
    if (!window.confirm(`Удалить тему «${t.name}»?`)) return
    setError(null)
    try {
      await deleteTopic(t.id)
      await reload()
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Не удалось удалить тему.',
      )
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Темы</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Добавить тему
        </button>
      </div>
      <p className="mt-2 text-slate-600">
        Для каждой темы задаются пороги оценки: нижний и верхний (по умолчанию {DEFAULT_H_LOW} и{' '}
        {DEFAULT_H_HIGH}) — они определяют метки «повторить / закрепить / освоено» и подбор материалов
        после теста.
      </p>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-8 text-slate-500">Загрузка…</p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Описание</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Нижний</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">Верхний</th>
                <th className="px-4 py-3 font-medium w-40" />
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {topics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Тем пока нет.
                  </td>
                </tr>
              ) : (
                topics.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.description ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {topicThresholds(t).hLow}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {topicThresholds(t).hHigh}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="mr-2 text-emerald-700 hover:underline"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t)}
                        className="text-red-700 hover:underline"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">
              {modal === 'create' ? 'Новая тема' : 'Редактировать тему'}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Название
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Описание
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Нижний (0…1)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={hLow}
                    onChange={(e) => setHLow(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Верхний (0…1)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={hHigh}
                    onChange={(e) => setHHigh(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Дефолты при создании: {DEFAULT_H_LOW} и {DEFAULT_H_HIGH}. Должно выполняться: нижний &lt;
                верхний.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
