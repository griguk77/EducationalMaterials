import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { loginApi } from '../../api/authApi'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import type { AuthUser, UserRole } from '../../types/auth'

/** Не возвращаем на экран прохождения теста — после входа как при обычной авторизации. */
function redirectPathAfterLogin(
  from: string | undefined,
  role: UserRole,
): string {
  if (from && !from.startsWith('/student/test/')) {
    return from
  }
  return role === 'teacher' ? '/teacher/topics' : '/student'
}

export function LoginPage() {
  const { token, user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from
    ?.pathname

  const [loginField, setLoginField] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (token && user) {
    return (
      <Navigate to={redirectPathAfterLogin(from, user.role)} replace />
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await loginApi(loginField.trim(), password)
      const authUser: AuthUser = {
        id: res.user.id,
        name: res.user.name,
        role: res.user.role,
      }
      login(res.accessToken, authUser)
      navigate(redirectPathAfterLogin(from, authUser.role), { replace: true })
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Не удалось войти. Проверьте backend и сеть.'
      setError(msg)
    } finally {
      setPending(false)
    }
  }

  function fillDemo(which: 'student' | 'teacher') {
    if (which === 'student') {
      setLoginField('student')
      setPassword('student123')
    } else {
      setLoginField('teacher')
      setPassword('teacher123')
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-slate-100 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          Вход
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Учётные данные проверяются на сервере; выдаётся JWT.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

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
              required
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
              required
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending ? 'Вход…' : 'Войти'}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fillDemo('student')}
            className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Подставить: учащийся
          </button>
          <button
            type="button"
            onClick={() => fillDemo('teacher')}
            className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Подставить: преподаватель
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Нет аккаунта?{' '}
          <Link
            to="/register"
            className="font-medium text-emerald-700 hover:underline"
          >
            Регистрация
          </Link>
        </p>
      </div>
    </div>
  )
}
