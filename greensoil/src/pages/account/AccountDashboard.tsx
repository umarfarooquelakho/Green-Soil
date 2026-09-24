import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, MapPin, Bell, User, ArrowRight, ShoppingBag } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { orderService } from '@/services/orderService'
import type { Order } from '@/types/order.types'
import { formatCurrency, formatDateShort } from '@/lib/utils'

export default function AccountDashboard() {
  const { user } = useAuth()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    orderService.getMyOrders(user.id, 1, 5).then((res) => {
      setRecentOrders(res.data)
      setLoading(false)
    })
  }, [user])

  const quickLinks = [
    { label: 'My Orders', href: '/account/orders', icon: Package, desc: 'Track and manage orders' },
    { label: 'Profile', href: '/account/profile', icon: User, desc: 'Update your information' },
    { label: 'Addresses', href: '/account/addresses', icon: MapPin, desc: 'Manage delivery addresses' },
    { label: 'Notifications', href: '/account/notifications', icon: Bell, desc: 'View notifications' },
  ]

  return (
    <div>
      {/* Welcome */}
      <div className="bg-primary-50 rounded-xl p-6 border border-primary-100 mb-6">
        <h1 className="text-xl font-bold text-dark-900">
          Welcome back, {user?.profile?.full_name?.split(' ')[0] ?? 'there'}! 👋
        </h1>
        <p className="text-dark-500 text-sm mt-1">
          Manage your orders, profile, and preferences from your dashboard.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="bg-white rounded-xl p-4 border border-dark-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-3">
              <link.icon className="w-5 h-5 text-primary-600" />
            </div>
            <p className="font-semibold text-dark-800 text-sm">{link.label}</p>
            <p className="text-xs text-dark-400 mt-0.5 hidden sm:block">{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <Card padding="none">
        <div className="flex items-center justify-between p-5 border-b border-dark-100">
          <h2 className="font-bold text-dark-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary-600" />
            Recent Orders
          </h2>
          <Link
            to="/account/orders"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6"><PageLoading /></div>
        ) : recentOrders.length === 0 ? (
          <div className="p-10 text-center text-dark-500 text-sm">
            <Package className="w-10 h-10 text-dark-200 mx-auto mb-3" />
            <p>No orders yet. Start shopping!</p>
            <Link to="/products" className="text-primary-600 hover:underline font-medium mt-2 inline-block">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-dark-50">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-dark-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-dark-900 text-sm">{order.order_number}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{formatDateShort(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <OrderStatusBadge status={order.status} />
                  <p className="text-sm font-bold text-dark-900 mt-1">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
