import { Link, useParams } from 'react-router-dom'

export function TestFlowPage() {
  const { topicId } = useParams<{ topicId: string }>()

  return (
    <div>
      <p className="text-sm text-slate-500">
        <Link to="/student/topics" className="text-emerald-700 hover:underline">
          ← К списку тем
        </Link>
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">
        Прохождение теста
      </h1>
      <p className="mt-2 text-slate-600">
        Тема (topic): <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">{topicId}</code>
      </p>
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-slate-600">
        Здесь будет пошаговая выдача вопросов, отправка ответов и таймер после
        подключения API сессии теста.
      </div>
    </div>
  )
}
