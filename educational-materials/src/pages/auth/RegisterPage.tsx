import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { registerApi } from '../../api/authApi'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import type { AuthUser } from '../../types/auth'

export function RegisterPage() {
  const { token, login } = useAuth()
  const navigate = useNavigate()

  const [loginField, setLoginField] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (token) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await registerApi({
        login: loginField.trim(),
        password,
        name: name.trim(),
        role,
      })
      const authUser: AuthUser = {
        id: res.user.id,
        name: res.user.name,
        role: res.user.role,
      }
      login(res.accessToken, authUser)
      navigate(
        authUser.role === 'teacher' ? '/teacher/topics' : '/student',
        { replace: true },
      )
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : 'Не удалось зарегистрироваться.'
      setError(msg)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-slate-100 px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          Регистрация
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Пароль не короче 8 символов. Роль выбирается явно.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700"
            >
              Имя
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              required
            />
          </div>
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              required
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-slate-700"
            >
              Роль
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as 'STUDENT' | 'TEACHER')
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="STUDENT">Обучающийся</option>
              <option value="TEACHER">Преподаватель</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending ? 'Отправка…' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Уже есть аккаунт?{' '}
          <Link
            to="/login"
            className="font-medium text-emerald-700 hover:underline"
          >
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
