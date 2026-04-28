import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/auth-context.js'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <div className="page-center" style={{ flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner" />
        <span>Loading your workspace…</span>
      </div>
    )
  }

  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/'} replace />} />
    </Routes>
  )
}

export default App
