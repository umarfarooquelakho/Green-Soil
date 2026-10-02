import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  Package,
  Users,
  Bell,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/shared/Logo'
import toast from 'react-hot-toast'

const navItems = [
  { label: 'Dashboard', href: '/employee', icon: LayoutDashboard, end: true },
  { label: 'My Profile', href: '/employee/profile', icon: User },
  { label: 'Orders', href: '/employee/orders', icon: Package },
  { label: 'Customers', href: '/employee/customers', icon: Users },
  { label: 'Notifications', href: '/employee/notifications', icon: Bell },
]

export function EmployeeLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    toast.success('Signed out')
  }

  return (
    <div className="min-h-screen bg-dark-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary-800 text-white px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <Logo size="sm" inverted />
          <span className="text-white/50 text-sm hidden sm:inline">/ Employee Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/80 hidden sm:block">
            {user?.profile?.full_name}
          </span>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-52 shrink-0">
          <nav className="bg-white rounded-xl border border-dark-100 overflow-hidden sticky top-20" aria-label="Employee navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium border-b border-dark-50 last:border-0 transition-colors',
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-dark-700 hover:bg-dark-50'
                  )
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
