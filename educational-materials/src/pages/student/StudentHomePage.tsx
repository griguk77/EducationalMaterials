import { Link } from 'react-router-dom'

export function StudentHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Личный кабинет</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Здесь будет обзор: активные тесты, последние результаты и рекомендации
        после подключения API.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        <li>
          <Link
            to="/student/topics"
            className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow"
          >
            <span className="font-medium text-slate-900">Тесты по темам</span>
            <span className="mt-1 block text-sm text-slate-500">
              Выбор темы и прохождение
            </span>
          </Link>
        </li>
        <li>
          <Link
            to="/student/results"
            className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow"
          >
            <span className="font-medium text-slate-900">Мои результаты</span>
            <span className="mt-1 block text-sm text-slate-500">
              История попыток
            </span>
          </Link>
        </li>
      </ul>
    </div>
  )
}
