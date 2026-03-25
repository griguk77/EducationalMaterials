export function StudentMaterialsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Рекомендованные материалы
      </h1>
      <p className="mt-2 text-slate-600">
        Список материалов по темам (article / video) придёт из рекомендательного
        блока API.
      </p>
      <ul className="mt-8 space-y-3 text-slate-500">
        <li className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center">
          Пока пусто — заглушка
        </li>
      </ul>
    </div>
  )
}
