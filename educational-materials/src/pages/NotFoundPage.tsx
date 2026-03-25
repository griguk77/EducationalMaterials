import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-6xl font-bold text-slate-300">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-800">
        Страница не найдена
      </h1>
      <p className="mt-2 text-slate-600">
        Проверьте адрес или вернитесь на главную.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        На главную
      </Link>
    </div>
  )
}
