import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Package,
  Users,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/shared/Logo'
import toast from 'react-hot-toast'

const navItems = [
  { label: 'Dashboard', href: '/management', icon: LayoutDashboard, end: true },
  { label: 'Reports', href: '/management/reports', icon: BarChart3 },
  { label: 'Sales', href: '/management/sales', icon: TrendingUp },
  { label: 'Inventory', href: '/management/inventory', icon: Package },
  { label: 'Employees', href: '/management/employees', icon: Users },
]

export function ManagementLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    toast.success('Signed out')
  }

  return (
    <div className="flex h-screen bg-dark-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-dark-900 flex flex-col shrink-0 hidden lg:flex">
        <div className="flex items-center gap-2.5 p-4 border-b border-dark-800">
          <Logo size="sm" inverted />
          <span className="text-xs text-dark-400 whitespace-nowrap border-l border-dark-700 pl-2.5 ml-0.5">Mgmt</span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                )
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-dark-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.profile?.full_name?.[0]?.toUpperCase() ?? 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {user?.profile?.full_name ?? 'Manager'}
              </p>
              <p className="text-xs text-dark-400">{user?.profile?.role}</p>
            </div>
            <button onClick={handleSignOut} className="text-dark-400 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <Outlet />
      </main>
    </div>
  )
}
