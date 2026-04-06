import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import type { CompleteSessionResponse, StudentQuestionDto } from '../../api/types'
import { useTestSessionLeave } from '../../contexts/TestSessionLeaveContext'
import {
  clearStoredActiveSession,
  writeStoredActiveSession,
} from '../../utils/activeTestSessionStorage'
import {
  completeSession,
  startTestSession,
  submitAnswer,
} from '../../api/sessionsApi'

function masteryLabelRu(label: string): string {
  switch (label) {
    case 'repeat':
      return 'требуется повторение'
    case 'consolidate':
      return 'закрепление'
    case 'mastered':
      return 'тема усвоена'
    default:
      return label
  }
}

export function TestFlowPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const tid = topicId ? Number(topicId) : NaN
  const navigate = useNavigate()
  const { registerActiveSession, confirmLeaveIfNeeded } = useTestSessionLeave()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [noQuestionsInTopic, setNoQuestionsInTopic] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<StudentQuestionDto | null>(
    null,
  )
  const [phase, setPhase] = useState<'run' | 'done'>('run')
  const [result, setResult] = useState<CompleteSessionResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)

  const [singleChoice, setSingleChoice] = useState<string>('')
  const [multiChoice, setMultiChoice] = useState<Record<string, boolean>>({})
  const [textAnswer, setTextAnswer] = useState('')

  const questionStartedAt = useRef<number>(0)

  const resetAnswerUi = useCallback(() => {
    setSingleChoice('')
    setMultiChoice({})
    setTextAnswer('')
  }, [])

  useEffect(() => {
    const active =
      phase === 'run' && sessionId != null && !loading
    registerActiveSession(active ? sessionId : null)
    return () => registerActiveSession(null)
  }, [phase, sessionId, loading, registerActiveSession])

  useEffect(() => {
    if (!topicId || Number.isNaN(tid)) {
      setError('Некорректный идентификатор темы')
      setLoading(false)
      return
    }

    const ac = new AbortController()
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const start = await startTestSession(tid, ac.signal)
        if (cancelled || ac.signal.aborted) return
        setSessionId(start.sessionId)
        writeStoredActiveSession(start.sessionId, tid)
        const first = start.question
        setCurrentQuestion(first)
        setNoQuestionsInTopic(first == null)
        questionStartedAt.current = performance.now()
        resetAnswerUi()
      } catch (e) {
        if (cancelled || ac.signal.aborted) return
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(
          e instanceof ApiError
            ? e.message
            : 'Не удалось начать сессию теста.',
        )
      } finally {
        if (!cancelled && !ac.signal.aborted) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      ac.abort()
    }
  }, [topicId, tid, resetAnswerUi])

  useEffect(() => {
    if (phase === 'done') {
      clearStoredActiveSession()
    }
  }, [phase])

  useEffect(() => {
    questionStartedAt.current = performance.now()
  }, [currentQuestion])

  function goToTopics() {
    confirmLeaveIfNeeded(() => navigate('/student/topics')) 
  }

  function toggleMulti(optionId: string) {
    setMultiChoice((prev) => ({ ...prev, [optionId]: !prev[optionId] }))
  }

  function buildUserAnswer(q: StudentQuestionDto): string | null {
    if (q.answerType === 'SINGLE') {
      if (!singleChoice) return null
      return singleChoice
    }
    if (q.answerType === 'MULTIPLE') {
      const ids = Object.entries(multiChoice)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .sort()
      if (ids.length === 0) return null
      return JSON.stringify(ids)
    }
    const t = textAnswer.trim()
    if (!t) return null
    return t
  }

  async function handleSubmitAnswer() {
    if (!sessionId || !currentQuestion) return
    const userAnswer = buildUserAnswer(currentQuestion)
    if (userAnswer == null) {
      setError('Ответьте на вопрос.')
      return
    }
    setError(null)
    setSubmitting(true)
    const responseTimeMs = Math.max(
      0,
      Math.round(performance.now() - questionStartedAt.current),
    )
    try {
      const next = await submitAnswer(sessionId, {
        questionId: Number(currentQuestion.id),
        userAnswer,
        responseTimeMs,
      })
      resetAnswerUi()
      setCurrentQuestion(next.nextQuestion ?? null)
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Не удалось отправить ответ.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleComplete() {
    if (!sessionId) return
    setError(null)
    setCompleting(true)
    try {
      const done = await completeSession(sessionId)
      setResult(done)
      setPhase('done')
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Не удалось завершить тест.',
      )
    } finally {
      setCompleting(false)
    }
  }

  const awaitingFinish =
    phase === 'run' &&
    sessionId &&
    !loading &&
    currentQuestion == null &&
    !noQuestionsInTopic

  if (loading) {
    return (
      <div>
        <p className="text-sm text-slate-500">
          <button
            type="button"
            onClick={goToTopics}
            className="text-emerald-700 hover:underline"
          >
            ← К списку тем
          </button>
        </p>
        <p className="mt-6 text-slate-600">Подготовка сессии…</p>
      </div>
    )
  }

  if (phase === 'done' && result) {
    return (
      <div>
        <p className="text-sm text-slate-500">
          <button
            type="button"
            onClick={() => navigate('/student/topics')}
            className="text-emerald-700 hover:underline"
          >
            ← К списку тем
          </button>
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          Результат теста
        </h1>
        <p className="mt-2 text-slate-600">
          Уровень усвоения (M<sub>C</sub>):{' '}
          <span className="font-medium text-slate-900">
            {result.masteryScore.toFixed(3)}
          </span>{' '}
          — {masteryLabelRu(result.masteryLabel)}
        </p>

        <h2 className="mt-8 text-lg font-medium text-slate-900">
          Рекомендованные материалы
        </h2>
        <ul className="mt-4 space-y-3">
          {result.recommendations.length === 0 ? (
            <li className="text-slate-500">Материалов нет.</li>
          ) : (
            result.recommendations.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-medium text-slate-900">{m.title}</p>
                <p className="text-xs text-slate-500">
                  {m.type} · уровень {m.difficultyLevel}
                </p>
                <a
                  href={m.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-emerald-700 hover:underline"
                >
                  Открыть ссылку
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            <button
              type="button"
              onClick={goToTopics}
              className="text-emerald-700 hover:underline"
            >
              ← К списку тем
            </button>
          </p>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Прохождение теста
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Тема ID:{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">{topicId}</code>
          </p>
        </div>
        {sessionId && phase === 'run' ? (
          <button
            type="button"
            onClick={goToTopics}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Завершить тест
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {sessionId && noQuestionsInTopic ? (
        <div className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-700">
            В этой теме пока нет вопросов. Можно зафиксировать пустой результат
            или завершить тест без оценки.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleComplete}
              disabled={completing}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {completing ? 'Сохранение…' : 'Зафиксировать результат'}
            </button>
            <button
              type="button"
              onClick={goToTopics}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Завершить тест без оценки
            </button>
          </div>
        </div>
      ) : null}

      {currentQuestion ? (
        <div className="mt-8 space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs text-slate-500">
              Вопрос · {currentQuestion.answerType}
              {currentQuestion.normativeTimeMs != null
                ? ` · нормативное время ~ ${Math.round(currentQuestion.normativeTimeMs / 1000)} с`
                : null}
            </p>
            <p className="mt-2 text-slate-900">{currentQuestion.text}</p>
          </div>

          {currentQuestion.answerType === 'SINGLE' &&
          currentQuestion.options?.length ? (
            <ul className="space-y-2">
              {currentQuestion.options.map((o) => (
                <li key={o.id}>
                  <label className="flex cursor-pointer items-start gap-2 text-slate-800">
                    <input
                      type="radio"
                      name="single"
                      className="mt-1"
                      checked={singleChoice === o.id}
                      onChange={() => setSingleChoice(o.id)}
                    />
                    <span>{o.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : null}

          {currentQuestion.answerType === 'MULTIPLE' &&
          currentQuestion.options?.length ? (
            <ul className="space-y-2">
              {currentQuestion.options.map((o) => (
                <li key={o.id}>
                  <label className="flex cursor-pointer items-start gap-2 text-slate-800">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={!!multiChoice[o.id]}
                      onChange={() => toggleMulti(o.id)}
                    />
                    <span>{o.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : null}

          {currentQuestion.answerType === 'TEXT' ? (
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder="Введите ответ"
            />
          ) : null}

          <button
            type="button"
            onClick={handleSubmitAnswer}
            disabled={submitting}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? 'Отправка…' : 'Ответить'}
          </button>
        </div>
      ) : null}

      {awaitingFinish ? (
        <div className="mt-8 rounded-xl border border-emerald-100 bg-emerald-50/80 p-6">
          <p className="text-slate-800">
            Ответы на все вопросы отправлены. Нажмите «Показать результат», чтобы
            получить оценку M<sub>C</sub> и рекомендации.
          </p>
          <button
            type="button"
            onClick={handleComplete}
            disabled={completing}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {completing ? 'Загрузка…' : 'Показать результат'}
          </button>
        </div>
      ) : null}
    </div>
  )
}
