import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import AlertsPage from './pages/AlertsPage'
import StaffPage from './pages/StaffPage'
import CategoriesPage from './pages/CategoriesPage'
import SuppliersPage from './pages/SuppliersPage'
import ProfilePage from './pages/ProfilePage'
import AuditPage from './pages/AuditPage'
import ForceChangePasswordPage from './pages/ForceChangePasswordPage'

function ForcePasswordGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />
  }
  return <>{children}</>
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      {/* Force password change — full screen, no sidebar */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ForceChangePasswordPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ForcePasswordGuard>
              <Layout />
            </ForcePasswordGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="staff" element={<AdminRoute><StaffPage /></AdminRoute>} />
        <Route path="categories" element={<AdminRoute><CategoriesPage /></AdminRoute>} />
        <Route path="suppliers" element={<AdminRoute><SuppliersPage /></AdminRoute>} />
        <Route path="audit" element={<AdminRoute><AuditPage /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}