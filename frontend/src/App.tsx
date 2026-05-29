import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/app/DashboardPage'
import ChatPage from './pages/app/ChatPage'
import TasksPage from './pages/app/TasksPage'
import DocumentsPage from './pages/app/DocumentsPage'
import AnalyticsPage from './pages/app/AnalyticsPage'
import WorkspacePage from './pages/app/WorkspacePage'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const { checkAuth } = useAuthStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme)
    checkAuth()
  }, [theme, checkAuth])

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="chat/:chatId" element={<ChatPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="workspace" element={<WorkspacePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}

export default App
