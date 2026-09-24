import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { User, Package, Users, Bell } from 'lucide-react'

export default function EmployeeDashboard() {
  const { user } = useAuth()

  const modules = [
    { label: 'My Profile', href: '/employee/profile', icon: User, desc: 'View and update your profile' },
    { label: 'Orders', href: '/employee/orders', icon: Package, desc: 'View assigned orders' },
    { label: 'Customers', href: '/employee/customers', icon: Users, desc: 'View customer list' },
    { label: 'Notifications', href: '/account/notifications', icon: Bell, desc: 'Your notifications' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-900">
          Hello, {user?.profile?.full_name?.split(' ')[0] ?? 'Employee'} 👋
        </h1>
        <p className="text-dark-500 text-sm mt-1">Employee Portal — {user?.profile?.role}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            to={mod.href}
            className="bg-white rounded-xl p-5 border border-dark-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-3">
              <mod.icon className="w-6 h-6 text-primary-600" />
            </div>
            <p className="font-semibold text-dark-800 text-sm">{mod.label}</p>
            <p className="text-xs text-dark-400 mt-1">{mod.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
