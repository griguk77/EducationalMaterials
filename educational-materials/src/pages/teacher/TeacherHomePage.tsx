import { Link } from 'react-router-dom'

export function TeacherHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Кабинет преподавателя
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Управление темами, вопросами, материалами и просмотр результатов
        учащихся — после подключения API.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        <li>
          <Link
            to="/teacher/topics"
            className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow"
          >
            <span className="font-medium text-slate-900">Темы</span>
            <span className="mt-1 block text-sm text-slate-500">
              CRUD учебных тем
            </span>
          </Link>
        </li>
        <li>
          <Link
            to="/teacher/student-results"
            className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow"
          >
            <span className="font-medium text-slate-900">
              Результаты учащихся
            </span>
            <span className="mt-1 block text-sm text-slate-500">
              Просмотр попыток
            </span>
          </Link>
        </li>
      </ul>
    </div>
  )
}
