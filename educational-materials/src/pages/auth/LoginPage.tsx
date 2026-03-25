import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export function LoginPage() {
  const { token, user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from
    ?.pathname

  const [loginField, setLoginField] = useState('')
  const [password, setPassword] = useState('')

  if (token && user) {
    return <Navigate to={from || '/'} replace />
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Заглушка до подключения API: демо-вход по полю логина
    const role =
      loginField.toLowerCase().includes('teacher') ||
      loginField.toLowerCase().includes('prep')
        ? 'teacher'
        : 'student'
    login('demo-jwt-token', {
      id: '1',
      name: role === 'teacher' ? 'Преподаватель (демо)' : 'Обучающийся (демо)',
      role,
    })
    navigate(from || (role === 'teacher' ? '/teacher/topics' : '/student/topics'), {
      replace: true,
    })
  }

  function demoLogin(role: 'student' | 'teacher') {
    login('demo-jwt-token', {
      id: role === 'teacher' ? 't1' : 's1',
      name: role === 'teacher' ? 'Преподаватель (демо)' : 'Обучающийся (демо)',
      role,
    })
    navigate(role === 'teacher' ? '/teacher/topics' : '/student/topics', {
      replace: true,
    })
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-slate-100 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          Вход
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          JWT будет выдан backend; сейчас — демо-форма.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="login"
              className="block text-sm font-medium text-slate-700"
            >
              Логин
            </label>
            <input
              id="login"
              name="login"
              autoComplete="username"
              value={loginField}
              onChange={(e) => setLoginField(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder="student или teacher"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Войти
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Подсказка: если в логине есть «teacher» или «prep», выдаётся роль
          преподавателя; иначе — обучающийся.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => demoLogin('student')}
            className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Демо: учащийся
          </button>
          <button
            type="button"
            onClick={() => demoLogin('teacher')}
            className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Демо: преподаватель
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Нет аккаунта?{' '}
          <Link to="/register" className="font-medium text-emerald-700 hover:underline">
            Регистрация
          </Link>
        </p>
      </div>
    </div>
  )
}
