import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

type LogoutCtx = {
  confirmLogout: (onConfirm: () => void) => void
}

const LogoutConfirmContext = createContext<LogoutCtx | null>(null)

export function LogoutConfirmProvider({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const confirmLogout = useCallback((onConfirm: () => void) => {
    setPendingAction(() => onConfirm)
    setModalOpen(true)
  }, [])

  const handleConfirm = () => {
    const act = pendingAction
    setPendingAction(null)
    setModalOpen(false)
    act?.()
  }

  const handleCancel = () => {
    setModalOpen(false)
    setPendingAction(null)
  }

  return (
    <LogoutConfirmContext.Provider value={{ confirmLogout }}>
      {children}
      {modalOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
          >
            <h2
              id="logout-title"
              className="text-lg font-semibold text-slate-900"
            >
              Выйти из аккаунта?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Вы будете разлогинены и попадёте на страницу входа.
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
    </LogoutConfirmContext.Provider>
  )
}

export function useLogoutConfirm(): LogoutCtx {
  const ctx = useContext(LogoutConfirmContext)
  if (!ctx) {
    throw new Error(
      'useLogoutConfirm must be used within LogoutConfirmProvider',
    )
  }
  return ctx
}

