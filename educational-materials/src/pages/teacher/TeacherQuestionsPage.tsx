import { useEffect, useState } from 'react'
import { ApiError } from '../../api/client'
import {
  createQuestion,
  deleteQuestion,
  fetchQuestionsForTopic,
  updateQuestion,
} from '../../api/questionsApi'
import { fetchTopics } from '../../api/topicsApi'
import type {
  AnswerType,
  QuestionTeacherDto,
  TopicDto,
} from '../../api/types'
import { answerTypeLabelRu } from '../../utils/answerTypeLabels'

const OPTION_IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

type Mode = 'create' | 'edit'

export function TeacherQuestionsPage() {
  const [topics, setTopics] = useState<TopicDto[]>([])
  const [topicId, setTopicId] = useState<string>('')
  const [questions, setQuestions] = useState<QuestionTeacherDto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingQs, setLoadingQs] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('create')
  const [editing, setEditing] = useState<QuestionTeacherDto | null>(null)
  const [saving, setSaving] = useState(false)

  const [text, setText] = useState('')
  const [answerType, setAnswerType] = useState<AnswerType>('SINGLE')
  const [optionCount, setOptionCount] = useState(2)
  const [optionTexts, setOptionTexts] = useState<string[]>(['', ''])
  const [correctSingle, setCorrectSingle] = useState<number | null>(0)
  const [correctMulti, setCorrectMulti] = useState<boolean[]>([false, false])
  const [correctText, setCorrectText] = useState('')
  const [difficulty, setDifficulty] = useState(0.5)
  const [normSeconds, setNormSeconds] = useState<string>('')

  async function reloadQuestions(currentTopicId: string) {
    const list = await fetchQuestionsForTopic(currentTopicId)
    setQuestions(list)
  }

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
      setLoadingQs(true)
      setError(null)
      try {
        const list = await fetchQuestionsForTopic(topicId)
        if (!cancelled) setQuestions(list)
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError
              ? e.message
              : 'Не удалось загрузить вопросы.',
          )
        }
      } finally {
        if (!cancelled) setLoadingQs(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [topicId])

  function ensureOptionArrays(count: number) {
    setOptionTexts((prev) => {
      const next = [...prev]
      while (next.length < count) next.push('')
      return next.slice(0, count)
    })
    setCorrectMulti((prev) => {
      const next = [...prev]
      while (next.length < count) next.push(false)
      return next.slice(0, count)
    })
    if (correctSingle != null && correctSingle >= count) {
      setCorrectSingle(count > 0 ? 0 : null)
    }
  }

  function openCreate() {
    setMode('create')
    setEditing(null)
    setText('')
    setAnswerType('SINGLE')
    setOptionCount(2)
    setOptionTexts(['', ''])
    setCorrectSingle(0)
    setCorrectMulti([true, false])
    setCorrectText('')
    setDifficulty(0.5)
    setNormSeconds('')
    setModalOpen(true)
  }

  function openEdit(q: QuestionTeacherDto) {
    setMode('edit')
    setEditing(q)
    setText(q.text)
    setAnswerType(q.answerType)
    if (q.answerType === 'TEXT') {
      setCorrectText(q.correctAnswer)
      setOptionCount(0)
      setOptionTexts([])
      setCorrectSingle(null)
      setCorrectMulti([])
    } else {
      const opts = q.options ?? []
      const baseOpts =
        opts.length > 0
          ? opts
          : [
              { id: 'a', text: '' },
              { id: 'b', text: '' },
            ]
      setOptionCount(baseOpts.length)
      const texts = baseOpts.map((o) => o.text)
      setOptionTexts(texts)
      if (q.answerType === 'SINGLE') {
        const idx = baseOpts.findIndex((o) => o.id === q.correctAnswer)
        setCorrectSingle(idx >= 0 ? idx : 0)
        setCorrectMulti(new Array(texts.length).fill(false))
      } else {
        let ids: string[] = []
        try {
          ids = JSON.parse(q.correctAnswer) as string[]
        } catch {
          ids = []
        }
        const flags = texts.map((_, i) =>
          ids.includes(baseOpts[i]?.id ?? OPTION_IDS[i]),
        )
        setCorrectMulti(flags)
        setCorrectSingle(null)
      }
      ensureOptionArrays(baseOpts.length)
    }
    setDifficulty(q.difficulty)
    setNormSeconds(
      q.normativeTimeMs != null
        ? String(Math.round(q.normativeTimeMs / 1000))
        : '',
    )
    setModalOpen(true)
  }

  function buildPayload() {
    let optionsJson: string | null = null
    let correctAnswer: string

    if (answerType === 'TEXT') {
      optionsJson = null
      correctAnswer = correctText.trim()
    } else {
      const texts = optionTexts.slice(0, optionCount).map((t) => t.trim())
      const opts = texts.map((t, i) => ({
        id: OPTION_IDS[i],
        text: t || `Вариант ${i + 1}`,
      }))
      optionsJson = JSON.stringify(opts)
      if (answerType === 'SINGLE') {
        const idx = correctSingle ?? 0
        correctAnswer = OPTION_IDS[idx]
      } else {
        const ids = opts
          .map((o, i) => (correctMulti[i] ? o.id : null))
          .filter(Boolean) as string[]
        correctAnswer = JSON.stringify(ids)
      }
    }

    const normMs =
      normSeconds.trim() === ''
        ? null
        : Math.max(0, Math.round(Number(normSeconds) * 1000))

    return {
      text: text.trim(),
      optionsJson,
      correctAnswer,
      difficulty,
      answerType,
      normativeTimeMs:
        normMs != null && !Number.isNaN(normMs) ? normMs : null,
      orderIndex: null as number | null,
    }
  }

  async function handleSave() {
    if (!topicId) return
    setSaving(true)
    setError(null)
    try {
      const payload = buildPayload()
      if (mode === 'create') {
        await createQuestion(topicId, payload)
      } else if (mode === 'edit' && editing) {
        await updateQuestion(topicId, editing.id, payload)
      }
      await reloadQuestions(topicId)
      setModalOpen(false)
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : 'Не удалось сохранить вопрос.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(q: QuestionTeacherDto) {
    if (!topicId) return
    if (!window.confirm('Удалить вопрос?')) return
    setError(null)
    try {
      await deleteQuestion(topicId, q.id)
      const list = await fetchQuestionsForTopic(topicId)
      setQuestions(list)
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Не удалось удалить вопрос.',
      )
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Вопросы</h1>
        <button
          type="button"
          onClick={openCreate}
          disabled={!topicId}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Добавить вопрос
        </button>
      </div>
      <p className="mt-2 text-slate-600">
        Выберите тему. Для вопросов с выбором ответов варианты задаются как
        отдельные строки; отметьте правильные варианты. Норма времени
        задаётся в секундах.
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

      {loadingQs ? (
        <p className="mt-8 text-slate-500">Загрузка вопросов…</p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Текст</th>
                <th className="px-4 py-3 font-medium">Тип</th>
                <th className="px-4 py-3 font-medium w-28" />
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    Вопросов нет.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="border-b border-slate-100 align-top">
                    <td className="px-4 py-3">{q.text}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {answerTypeLabelRu(q.answerType)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(q)}
                        className="mr-2 text-emerald-700 hover:underline"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(q)}
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

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === 'create' ? 'Новый вопрос' : 'Редактировать вопрос'}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-3 md:col-span-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Текст вопроса
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Тип ответа
                    </label>
                    <select
                      value={answerType}
                      onChange={(e) =>
                        setAnswerType(e.target.value as AnswerType)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                    >
                      <option value="SINGLE">
                        {answerTypeLabelRu('SINGLE')}
                      </option>
                      <option value="MULTIPLE">
                        {answerTypeLabelRu('MULTIPLE')}
                      </option>
                      <option value="TEXT">{answerTypeLabelRu('TEXT')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Сложность 0–1
                    </label>
                    <input
                      type="number"
                      step={0.01}
                      min={0}
                      max={1}
                      value={difficulty}
                      onChange={(e) =>
                        setDifficulty(Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Норма времени (сек), опц.
                    </label>
                    <input
                      value={normSeconds}
                      onChange={(e) => setNormSeconds(e.target.value)}
                      placeholder="60"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {answerType !== 'TEXT' ? (
                <div className="space-y-3 md:col-span-2">
                  <div className="max-w-xs">
                    <label className="block text-sm font-medium text-slate-700">
                      Количество вариантов
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={OPTION_IDS.length}
                      value={optionCount}
                      onChange={(e) => {
                        const next = Math.min(
                          OPTION_IDS.length,
                          Math.max(2, Number(e.target.value) || 2),
                        )
                        setOptionCount(next)
                        ensureOptionArrays(next)
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: optionCount }).map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2"
                      >
                        {answerType === 'SINGLE' ? (
                          <input
                            type="radio"
                            name="correct-single"
                            className="h-4 w-4"
                            checked={correctSingle === index}
                            onChange={() => setCorrectSingle(index)}
                          />
                        ) : (
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={!!correctMulti[index]}
                            onChange={() =>
                              setCorrectMulti((prev) => {
                                const next = [...prev]
                                next[index] = !next[index]
                                return next
                              })
                            }
                          />
                        )}
                        <input
                          value={optionTexts[index] ?? ''}
                          onChange={(e) =>
                            setOptionTexts((prev) => {
                              const next = [...prev]
                              next[index] = e.target.value
                              return next
                            })
                          }
                          className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900"
                          placeholder={`Вариант ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Эталонный текст ответа (опционально)
                  </label>
                  <textarea
                    value={correctText}
                    onChange={(e) => setCorrectText(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                  <p className="text-xs text-slate-500">
                    Конкретное правило проверки текстового ответа задаётся на
                    backend.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !text.trim()}
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
