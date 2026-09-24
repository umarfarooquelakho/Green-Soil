import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCheck,
  Settings,
  FileText,
  Video,
  MessageSquare,
  BarChart3,
  Bell,
  ClipboardList,
  Layers,
  Wrench,
  Leaf,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Layers },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Employees', href: '/admin/employees', icon: UserCheck },
  { label: 'Services', href: '/admin/services', icon: Wrench },
  { label: 'Videos', href: '/admin/videos', icon: Video },
  { label: 'Content', href: '/admin/content', icon: FileText },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    toast.success('Signed out')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 p-5 border-b border-dark-800">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <Leaf className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <div className="font-bold text-white text-sm">GREEN SOIL</div>
          <div className="text-xs text-dark-400">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 scrollbar-thin" aria-label="Admin navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-700 text-white'
                  : 'text-dark-300 hover:text-white hover:bg-dark-800'
              )
            }
          >
            <item.icon className="w-4.5 h-4.5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-dark-800 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Website
        </a>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {user?.profile?.full_name ?? 'Admin'}
            </p>
            <p className="text-xs text-dark-400 truncate">{user?.profile?.role}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-dark-400 hover:text-red-400 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-dark-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-dark-900 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-0 bottom-0 w-60 bg-dark-900 z-50 lg:hidden animate-slide-up">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-dark-100 flex items-center justify-between px-4 shrink-0">
          <button
            className="lg:hidden p-2 text-dark-600 hover:bg-dark-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block">
            <h1 className="text-sm font-medium text-dark-600">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 text-dark-500 hover:text-dark-800 hover:bg-dark-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-label="Unread notifications" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <span className="hidden sm:block text-dark-700 font-medium">
                {user?.profile?.full_name?.split(' ')[0] ?? 'Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-dark-400" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
