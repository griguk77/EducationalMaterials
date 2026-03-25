export function TeacherTopicsPage() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Темы</h1>
        <button
          type="button"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Добавить тему
        </button>
      </div>
      <p className="mt-2 text-slate-600">
        Список тем (`Topic`) с редактированием названия и описания — заглушка
        до API.
      </p>
      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
        Таблица тем появится здесь
      </div>
    </div>
  )
}
