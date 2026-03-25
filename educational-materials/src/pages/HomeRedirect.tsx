import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function HomeRedirect() {
  const { token, user } = useAuth()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'student') {
    return <Navigate to="/student/topics" replace />
  }

  return <Navigate to="/teacher/topics" replace />
}
