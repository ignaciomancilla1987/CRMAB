import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@context/AuthContext'

// Layout
import MainLayout from '@components/layout/MainLayout'
import AuthLayout from '@components/layout/AuthLayout'

// Auth Pages
import LoginPage from '@modules/auth/pages/LoginPage'
import ForgotPasswordPage from '@modules/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '@modules/auth/pages/ResetPasswordPage'

// Module Pages
import DashboardPage from '@modules/auth/pages/DashboardPage'
import UsuariosPage from '@modules/usuarios/pages/UsuariosPage'
import ClientesPage from '@modules/clientes/pages/ClientesPage'
import PresupuestosPage from '@modules/presupuestador/pages/PresupuestosPage'
import CodigosPage from '@modules/presupuestador/pages/CodigosPage'
import PipelinePage from '@modules/pipeline/pages/PipelinePage'
import PagosPage from '@modules/pagos/pages/PagosPage'

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
)

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return children
}

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return children
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/presupuestos" element={<PresupuestosPage />} />
        <Route path="/codigos" element={<CodigosPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/pagos" element={<PagosPage />} />
      </Route>

      {/* Redirect root to dashboard or login */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
