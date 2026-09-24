import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FullPageLoading } from '@/components/ui/LoadingSpinner'
import type { UserRole } from '@/types/database.types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageLoading />

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (allowedRoles && user.profile) {
    const hasRole = allowedRoles.includes(user.profile.role)
    if (!hasRole) {
      // Redirect to appropriate dashboard based on role
      const role = user.profile.role
      if (role === 'CUSTOMER') return <Navigate to="/account" replace />
      if (role === 'EMPLOYEE') return <Navigate to="/employee" replace />
      if (role === 'DIRECTOR' || role === 'CEO') return <Navigate to="/management" replace />
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  )
}

export function ManagementRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'CEO', 'ADMIN']}>
      {children}
    </ProtectedRoute>
  )
}

export function EmployeeRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'CEO', 'ADMIN', 'EMPLOYEE']}>
      {children}
    </ProtectedRoute>
  )
}

export function CustomerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>{children}</ProtectedRoute>
  )
}

// Redirect already-logged-in users away from auth pages
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <FullPageLoading />

  if (user) {
    const role = user.profile?.role
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return <Navigate to="/admin" replace />
    if (role === 'DIRECTOR' || role === 'CEO') return <Navigate to="/management" replace />
    if (role === 'EMPLOYEE') return <Navigate to="/employee" replace />
    return <Navigate to="/account" replace />
  }

  return <>{children}</>
}
