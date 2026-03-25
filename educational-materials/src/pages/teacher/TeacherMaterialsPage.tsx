export function TeacherMaterialsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Учебные материалы
        </h1>
        <button
          type="button"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Добавить материал
        </button>
      </div>
      <p className="mt-2 text-slate-600">
        Материалы привязаны к теме: тип article / video, ссылка — после API.
      </p>
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
        Список материалов — заглушка
      </div>
    </div>
  )
}
