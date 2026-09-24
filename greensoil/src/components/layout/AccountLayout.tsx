import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  User,
  MapPin,
  Bell,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', href: '/account', icon: LayoutDashboard, end: true },
  { label: 'My Orders', href: '/account/orders', icon: Package },
  { label: 'Profile', href: '/account/profile', icon: User },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Notifications', href: '/account/notifications', icon: Bell },
]

export function AccountLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    toast.success('Signed out successfully')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-dark-100 overflow-hidden">
            {/* Profile summary */}
            <div className="p-4 bg-primary-50 border-b border-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.profile?.full_name?.[0]?.toUpperCase() ?? user?.email[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-dark-900 truncate">
                    {user?.profile?.full_name ?? 'Customer'}
                  </p>
                  <p className="text-xs text-dark-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="p-2" aria-label="Account navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                    )
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-dark-100"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
