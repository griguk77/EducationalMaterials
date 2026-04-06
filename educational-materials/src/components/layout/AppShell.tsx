import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTestSessionLeave } from '../../contexts/TestSessionLeaveContext'
import { useLogoutConfirm } from '../../contexts/LogoutConfirmContext'
import type { UserRole } from '../../types/auth'

type NavItem = { to: string; label: string }

const studentNav: NavItem[] = [
  { to: '/student', label: 'Главная' },
  { to: '/student/topics', label: 'Тесты по темам' },
  { to: '/student/results', label: 'Мои результаты' },
  { to: '/student/materials', label: 'Материалы' },
]

const teacherNav: NavItem[] = [
  { to: '/teacher', label: 'Главная' },
  { to: '/teacher/topics', label: 'Темы' },
  { to: '/teacher/questions', label: 'Вопросы' },
  { to: '/teacher/materials', label: 'Материалы' },
  { to: '/teacher/student-results', label: 'Результаты учащихся' },
]

function navForRole(role: UserRole): NavItem[] {
  return role === 'student' ? studentNav : teacherNav
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-emerald-700 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    confirmLeaveIfNeeded,
    confirmLogoutPreflightIfNeeded,
    abandonIfActiveAndThen,
  } = useTestSessionLeave()
  const { confirmLogout } = useLogoutConfirm()
  const nav = navForRole(user!.role)

  function handleLogout() {
    if (user!.role !== 'student') {
      confirmLogout(() => {
        logout()
        navigate('/login', { replace: true })
      })
      return
    }
    // 1) То же окно, что «Завершить тест» — без abandon; по «Да» → окно выхода.
    // 2) По «Да» в окне выхода — abandon + logout.
    confirmLogoutPreflightIfNeeded(() => {
      confirmLogout(() => {
        abandonIfActiveAndThen(() => {
          logout()
          navigate('/login', { replace: true })
        })
      })
    })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-lg font-semibold text-slate-800">
              Учебные материалы и тестирование
            </span>
            <span className="truncate text-sm text-slate-500">
              {user!.name} ·{' '}
              {user!.role === 'student' ? 'Обучающийся' : 'Преподаватель'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Выйти
          </button>
        </div>
        <nav
          className="mx-auto flex max-w-6xl flex-wrap gap-1 px-4 pb-3"
          aria-label="Основное меню"
        >
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/student' || item.to === '/teacher'}
              className={navLinkClass}
              onClick={(e) => {
                if (user!.role !== 'student') return
                if (location.pathname === item.to) return
                e.preventDefault()
                confirmLeaveIfNeeded(() => navigate(item.to))
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
