import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { TestSessionLeaveProvider } from './contexts/TestSessionLeaveContext'
import { LogoutConfirmProvider } from './contexts/LogoutConfirmContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LogoutConfirmProvider>
        <TestSessionLeaveProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </TestSessionLeaveProvider>
      </LogoutConfirmProvider>
    </BrowserRouter>
  </StrictMode>,
)
