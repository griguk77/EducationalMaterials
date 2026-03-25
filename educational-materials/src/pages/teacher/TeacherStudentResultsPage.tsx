export function TeacherStudentResultsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Результаты учащихся
      </h1>
      <p className="mt-2 text-slate-600">
        Агрегированные результаты и детализация по `AnswerResult` — после API.
      </p>
      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Учащийся</th>
              <th className="px-4 py-3 font-medium">Тема</th>
              <th className="px-4 py-3 font-medium">Балл</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                Нет данных (заглушка)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
