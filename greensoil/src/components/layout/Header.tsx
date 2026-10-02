import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/shared/Logo'
import toast from 'react-hot-toast'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Services', href: '/services' },
  { label: 'Videos', href: '/videos' },
  { label: 'CEO Message', href: '/ceo-message' },
  { label: 'Contact', href: '/contact' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, signOut, isAdmin, isManagement } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
    navigate('/')
    toast.success('Signed out successfully')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-white transition-shadow duration-200',
        scrolled ? 'shadow-md' : 'shadow-sm border-b border-dark-100'
      )}
    >
      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <Logo size="md" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === '/'}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-dark-700 hover:text-primary-700 hover:bg-primary-50'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-dark-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              aria-label={`Cart, ${itemCount} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px] text-[10px]">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-dark-50 transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.profile?.full_name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-dark-700 max-w-[100px] truncate">
                    {user.profile?.full_name?.split(' ')[0] ?? 'Account'}
                  </span>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-dark-400 transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-dark-100 rounded-xl shadow-lg z-20 py-1 animate-slide-down">
                      <div className="px-4 py-2.5 border-b border-dark-50">
                        <p className="text-sm font-semibold text-dark-900 truncate">
                          {user.profile?.full_name ?? 'User'}
                        </p>
                        <p className="text-xs text-dark-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-dark-700 hover:bg-dark-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-dark-400" />
                        My Account
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-dark-700 hover:bg-dark-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-dark-400" />
                        My Orders
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-dark-700 hover:bg-dark-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-dark-400" />
                          Admin Panel
                        </Link>
                      )}
                      {!isAdmin && isManagement && (
                        <Link
                          to="/management"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-dark-700 hover:bg-dark-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-dark-400" />
                          Dashboard
                        </Link>
                      )}
                      <div className="border-t border-dark-50 mt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-dark-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-dark-100 bg-white animate-slide-down">
          <nav className="px-4 py-3 space-y-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-dark-700 hover:text-primary-700 hover:bg-dark-50'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {!user && (
              <div className="flex gap-2 pt-2 border-t border-dark-100">
                <Button variant="outline" size="sm" fullWidth onClick={() => { navigate('/login'); setMobileOpen(false) }}>
                  Sign In
                </Button>
                <Button size="sm" fullWidth onClick={() => { navigate('/register'); setMobileOpen(false) }}>
                  Register
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
