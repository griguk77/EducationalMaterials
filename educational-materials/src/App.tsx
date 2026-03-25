import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { HomeRedirect } from './pages/HomeRedirect'
import { NotFoundPage } from './pages/NotFoundPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { StudentHomePage } from './pages/student/StudentHomePage'
import { StudentMaterialsPage } from './pages/student/StudentMaterialsPage'
import { StudentResultsPage } from './pages/student/StudentResultsPage'
import { TestFlowPage } from './pages/student/TestFlowPage'
import { TopicsPage } from './pages/student/TopicsPage'
import { TeacherHomePage } from './pages/teacher/TeacherHomePage'
import { TeacherMaterialsPage } from './pages/teacher/TeacherMaterialsPage'
import { TeacherQuestionsPage } from './pages/teacher/TeacherQuestionsPage'
import { TeacherStudentResultsPage } from './pages/teacher/TeacherStudentResultsPage'
import { TeacherTopicsPage } from './pages/teacher/TeacherTopicsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentHomePage />} />
        <Route path="topics" element={<TopicsPage />} />
        <Route path="test/:topicId" element={<TestFlowPage />} />
        <Route path="results" element={<StudentResultsPage />} />
        <Route path="materials" element={<StudentMaterialsPage />} />
      </Route>

      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherHomePage />} />
        <Route path="topics" element={<TeacherTopicsPage />} />
        <Route path="questions" element={<TeacherQuestionsPage />} />
        <Route path="materials" element={<TeacherMaterialsPage />} />
        <Route path="student-results" element={<TeacherStudentResultsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
