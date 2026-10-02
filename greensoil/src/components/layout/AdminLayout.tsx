import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
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
  Menu,
  X,
  LogOut,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/shared/Logo'
import toast from 'react-hot-toast'

const navItems = [
  { label: 'Dashboard',     href: '/admin',               icon: LayoutDashboard, end: true },
  { label: 'Products',      href: '/admin/products',       icon: Package },
  { label: 'Categories',    href: '/admin/categories',     icon: Layers },
  { label: 'Orders',        href: '/admin/orders',         icon: ShoppingCart },
  { label: 'Customers',     href: '/admin/customers',      icon: Users },
  { label: 'Employees',     href: '/admin/employees',      icon: UserCheck },
  { label: 'Services',      href: '/admin/services',       icon: Wrench },
  { label: 'Videos',        href: '/admin/videos',         icon: Video },
  { label: 'Content',       href: '/admin/content',        icon: FileText },
  { label: 'Messages',      href: '/admin/messages',       icon: MessageSquare },
  { label: 'Reports',       href: '/admin/reports',        icon: BarChart3 },
  { label: 'Notifications', href: '/admin/notifications',  icon: Bell },
  { label: 'Audit Logs',    href: '/admin/audit-logs',     icon: ClipboardList },
  { label: 'Settings',      href: '/admin/settings',       icon: Settings },
]

// ─── Sidebar nav — defined OUTSIDE component so it never remounts ──────────
interface SidebarNavProps {
  onNavigate?: () => void
}

function SidebarNav({ onNavigate }: SidebarNavProps) {
  const location = useLocation()
  const navRef   = useRef<HTMLElement>(null)
  const activeRef = useRef<HTMLAnchorElement>(null)

  // Scroll active item into view whenever the route changes
  useEffect(() => {
    if (activeRef.current && navRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [location.pathname])

  return (
    <nav
      ref={navRef}
      className="flex-1 overflow-y-auto p-3 space-y-0.5"
      aria-label="Admin navigation"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}
    >
      {navItems.map((item) => {
        // Determine active state manually (same logic as NavLink end prop)
        const isActive = item.end
          ? location.pathname === item.href
          : location.pathname.startsWith(item.href)

        return (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            ref={isActive ? activeRef : undefined}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-700 text-white'
                : 'text-dark-300 hover:text-white hover:bg-dark-800'
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

// ─── Sidebar shell — also stable, never remounts ───────────────────────────
interface SidebarShellProps {
  user: { profile?: { full_name?: string | null; role?: string } | null } | null
  onSignOut: () => void
  onNavigate?: () => void
}

function SidebarShell({ user, onSignOut, onNavigate }: SidebarShellProps) {
  return (
    <div className="flex flex-col h-full bg-dark-900">
      {/* Logo */}
      <div className="flex items-center gap-2.5 p-4 border-b border-dark-800 shrink-0">
        <Logo size="sm" inverted />
        <span className="text-xs text-dark-400 whitespace-nowrap border-l border-dark-700 pl-2.5">
          Admin
        </span>
      </div>

      {/* Scrollable nav */}
      <SidebarNav onNavigate={onNavigate} />

      {/* Footer */}
      <div className="p-3 border-t border-dark-800 space-y-1 shrink-0">
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
            onClick={onSignOut}
            className="text-dark-400 hover:text-red-400 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Layout ────────────────────────────────────────────────────────────
export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    toast.success('Signed out')
  }

  return (
    <div className="flex h-screen bg-dark-50 overflow-hidden">

      {/* ── Desktop sidebar (always mounted, never re-created) ── */}
      <aside className="hidden lg:flex w-60 flex-col shrink-0">
        <SidebarShell user={user} onSignOut={handleSignOut} />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden shadow-2xl">
            <SidebarShell
              user={user}
              onSignOut={handleSignOut}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </>
      )}

      {/* ── Main content ── */}
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

          {/* Current page label */}
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-dark-600">
              {navItems.find((n) =>
                n.end
                  ? location.pathname === n.href
                  : location.pathname.startsWith(n.href)
              )?.label ?? 'Admin Panel'}
            </p>
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
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
