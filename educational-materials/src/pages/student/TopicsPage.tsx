import { Link } from 'react-router-dom'

const PLACEHOLDER_TOPICS = [
  { id: '1', name: 'Введение в дисциплину', description: 'Пример темы из API' },
  { id: '2', name: 'Основные понятия', description: 'Ещё одна тема' },
]

export function TopicsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Тесты по темам</h1>
      <p className="mt-2 text-slate-600">
        Тема соответствует «тесту» в предметной области. Список подгрузится с
        сервера.
      </p>
      <ul className="mt-8 space-y-3">
        {PLACEHOLDER_TOPICS.map((topic) => (
          <li key={topic.id}>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <h2 className="font-medium text-slate-900">{topic.name}</h2>
                <p className="text-sm text-slate-500">{topic.description}</p>
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
    </div>
  )
}
