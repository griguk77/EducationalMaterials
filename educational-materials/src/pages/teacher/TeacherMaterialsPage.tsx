import { useEffect, useState } from 'react'
import { ApiError } from '../../api/client'
import {
  createMaterial,
  deleteMaterial,
  fetchMaterialsForTopic,
  updateMaterial,
} from '../../api/materialsApi'
import type { MaterialDto, MaterialType, TopicDto } from '../../api/types'
import { fetchTopics } from '../../api/topicsApi'

export function TeacherMaterialsPage() {
  const [topics, setTopics] = useState<TopicDto[]>([])
  const [topicId, setTopicId] = useState<string>('')
  const [materials, setMaterials] = useState<MaterialDto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMs, setLoadingMs] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<MaterialDto | null>(null)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [type, setType] = useState<MaterialType>('ARTICLE')
  const [difficultyLevel, setDifficultyLevel] = useState(3)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const list = await fetchTopics()
        if (!cancelled) {
          setTopics(list)
          if (list.length && !topicId) setTopicId(list[0].id)
        }
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

  useEffect(() => {
    if (!topicId) return
    let cancelled = false
    ;(async () => {
      setLoadingMs(true)
      setError(null)
      try {
        const list = await fetchMaterialsForTopic(topicId)
        if (!cancelled) setMaterials(list)
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError
              ? e.message
              : 'Не удалось загрузить материалы.',
          )
        }
      } finally {
        if (!cancelled) setLoadingMs(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [topicId])

  function openCreate() {
    setEditing(null)
    setTitle('')
    setLink('https://')
    setType('ARTICLE')
    setDifficultyLevel(3)
    setModal('create')
  }

  function openEdit(m: MaterialDto) {
    setEditing(m)
    setTitle(m.title)
    setLink(m.link)
    setType(m.type)
    setDifficultyLevel(m.difficultyLevel)
    setModal('edit')
  }

  async function handleSave() {
    if (!topicId) return
    setSaving(true)
    setError(null)
    try {
      if (modal === 'create') {
        await createMaterial(topicId, {
          title: title.trim(),
          link: link.trim(),
          type,
          difficultyLevel,
        })
      } else if (modal === 'edit' && editing) {
        await updateMaterial(topicId, editing.id, {
          title: title.trim(),
          link: link.trim(),
          type,
          difficultyLevel,
        })
      }
      const list = await fetchMaterialsForTopic(topicId)
      setMaterials(list)
      setModal(null)
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Не удалось сохранить материал.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(m: MaterialDto) {
    if (!topicId) return
    if (!window.confirm(`Удалить «${m.title}»?`)) return
    setError(null)
    try {
      await deleteMaterial(topicId, m.id)
      const list = await fetchMaterialsForTopic(topicId)
      setMaterials(list)
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Не удалось удалить материал.',
      )
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Учебные материалы
        </h1>
        <button
          type="button"
          onClick={openCreate}
          disabled={!topicId}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Добавить материал
        </button>
      </div>
      <p className="mt-2 text-slate-600">
        Материалы привязаны к теме; уровень 1–5 участвует в рекомендациях.
      </p>

      <div className="mt-4 max-w-md">
        <label className="block text-sm font-medium text-slate-700">Тема</label>
        <select
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          disabled={loading || topics.length === 0}
        >
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loadingMs ? (
        <p className="mt-8 text-slate-500">Загрузка…</p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Тип</th>
                <th className="px-4 py-3 font-medium">Уровень</th>
                <th className="px-4 py-3 font-medium w-40" />
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {materials.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Материалов нет.
                  </td>
                </tr>
              ) : (
                materials.map((m) => (
                  <tr key={m.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium">{m.title}</td>
                    <td className="px-4 py-3">{m.type}</td>
                    <td className="px-4 py-3">{m.difficultyLevel}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(m)}
                        className="mr-2 text-emerald-700 hover:underline"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m)}
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
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">
              {modal === 'create' ? 'Новый материал' : 'Редактировать материал'}
            </h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Название
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Ссылка
                </label>
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Тип
                  </label>
                  <select
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as MaterialType)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  >
                    <option value="ARTICLE">ARTICLE</option>
                    <option value="VIDEO">VIDEO</option>
                    <option value="EXTERNAL">EXTERNAL</option>
                    <option value="DOCUMENT">DOCUMENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Уровень 1–5
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={difficultyLevel}
                    onChange={(e) =>
                      setDifficultyLevel(Number(e.target.value))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>
              </div>
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
                disabled={saving || !title.trim() || !link.trim()}
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
