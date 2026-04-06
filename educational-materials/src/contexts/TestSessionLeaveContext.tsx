import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ACCESS_TOKEN_KEY } from '../auth/storage'
import {
  abandonAllUnfinishedWithToken,
  abandonSessionWithToken,
} from '../api/sessionsApi'
import {
  clearStoredActiveSession,
  readStoredActiveSessionId,
} from '../utils/activeTestSessionStorage'

type Ctx = {
  registerActiveSession: (sessionId: string | null) => void
  /** Если есть активная сессия теста — показать подтверждение, затем выполнить действие. */
  confirmLeaveIfNeeded: (action: () => void) => void
  /**
   * Первый шаг выхода из аккаунта: тот же текст, что у «прервать тест», но по «Да» сессия
   * не прерывается — вызывается callback (обычно открытие окна «Выйти из аккаунта?»).
   */
  confirmLogoutPreflightIfNeeded: (thenOpenLogout: () => void) => void
  /** Прервать активную сессию на сервере (если есть), затем выполнить действие. */
  abandonIfActiveAndThen: (action: () => void) => void
}

const TestSessionLeaveContext = createContext<Ctx | null>(null)

export function TestSessionLeaveProvider({ children }: { children: ReactNode }) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const activeSessionIdRef = useRef<string | null>(null)
  useEffect(() => {
    activeSessionIdRef.current = activeSessionId
  }, [activeSessionId])

  const [modalOpen, setModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  /** Модалка «прервать тест?» без abandon — только перед окном выхода из аккаунта. */
  const [logoutPreflightOpen, setLogoutPreflightOpen] = useState(false)
  const [pendingLogoutPreflight, setPendingLogoutPreflight] = useState<
    (() => void) | null
  >(null)
  /** Пока идёт abandon — не принимать повторную регистрацию с TestFlowPage. */
  const abandoningRef = useRef(false)

  const registerActiveSession = useCallback((id: string | null) => {
    if (id === null) {
      setActiveSessionId(null)
      activeSessionIdRef.current = null
      return
    }
    if (abandoningRef.current) return
    setActiveSessionId(id)
    activeSessionIdRef.current = id
  }, [])

  const confirmLeaveIfNeeded = useCallback((action: () => void) => {
    const sid = activeSessionIdRef.current ?? readStoredActiveSessionId()
    if (!sid) {
      action()
      return
    }
    setPendingAction(() => action)
    setModalOpen(true)
  }, [])

  const confirmLogoutPreflightIfNeeded = useCallback((thenOpenLogout: () => void) => {
    const has =
      activeSessionId != null ||
      activeSessionIdRef.current != null ||
      readStoredActiveSessionId() != null
    if (!has) {
      thenOpenLogout()
      return
    }
    setPendingLogoutPreflight(() => thenOpenLogout)
    setLogoutPreflightOpen(true)
  }, [activeSessionId])

  const abandonIfActiveAndThen = useCallback((action: () => void) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    abandoningRef.current = true
    ;(async () => {
      try {
        if (token) {
          try {
            await abandonAllUnfinishedWithToken(token)
          } catch {
            // сеть / сервер — всё равно продолжим выход
          }
        }
      } finally {
        clearStoredActiveSession()
        setActiveSessionId(null)
        activeSessionIdRef.current = null
        queueMicrotask(() => {
          abandoningRef.current = false
          action()
        })
      }
    })()
  }, [])

  const handleConfirm = async () => {
    const act = pendingAction
    setPendingAction(null)
    setModalOpen(false)
    abandoningRef.current = true
    const sid = activeSessionIdRef.current ?? readStoredActiveSessionId()
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    try {
      if (sid && token) {
        try {
          await abandonSessionWithToken(sid, token)
        } catch {
          // переход выполним даже при ошибке сети
        }
      }
    } finally {
      clearStoredActiveSession()
      setActiveSessionId(null)
      activeSessionIdRef.current = null
      act?.()
      queueMicrotask(() => {
        abandoningRef.current = false
      })
    }
  }

  const handleCancel = () => {
    setModalOpen(false)
    setPendingAction(null)
  }

  const handleLogoutPreflightConfirm = () => {
    const act = pendingLogoutPreflight
    setPendingLogoutPreflight(null)
    setLogoutPreflightOpen(false)
    act?.()
  }

  const handleLogoutPreflightCancel = () => {
    setLogoutPreflightOpen(false)
    setPendingLogoutPreflight(null)
  }

  return (
    <TestSessionLeaveContext.Provider
      value={{
        registerActiveSession,
        confirmLeaveIfNeeded,
        confirmLogoutPreflightIfNeeded,
        abandonIfActiveAndThen,
      }}
    >
      {children}
      {modalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-test-title"
          >
            <h2
              id="leave-test-title"
              className="text-lg font-semibold text-slate-900"
            >
              Прервать прохождение теста?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Попытка будет сохранена как незавершённая. Балл M<sub>C</sub> по
              этой попытке не рассчитывается.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Нет
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Да
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {logoutPreflightOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-preflight-title"
          >
            <h2
              id="logout-preflight-title"
              className="text-lg font-semibold text-slate-900"
            >
              Прервать прохождение теста?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Попытка будет сохранена как незавершённая. Балл M<sub>C</sub> по
              этой попытке не рассчитывается.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleLogoutPreflightCancel}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Нет
              </button>
              <button
                type="button"
                onClick={handleLogoutPreflightConfirm}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Да
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </TestSessionLeaveContext.Provider>
  )
}

export function useTestSessionLeave(): Ctx {
  const ctx = useContext(TestSessionLeaveContext)
  if (!ctx) {
    throw new Error(
      'useTestSessionLeave must be used within TestSessionLeaveProvider',
    )
  }
  return ctx
}
