import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { orderService } from '@/services/orderService'
import type { Order } from '@/types/order.types'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

export default function MyOrders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    orderService.getMyOrders(user.id, page, 10).then((res) => {
      setOrders(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
      setLoading(false)
    })
  }, [user, page])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-dark-900">My Orders</h1>
        <span className="text-sm text-dark-500">{total} order{total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <PageLoading />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="No orders yet"
          description="Your order history will appear here once you make a purchase."
          action={{ label: 'Start Shopping', onClick: () => navigate('/products') }}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} to={`/account/orders/${order.id}`}>
              <Card hover className="block">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-dark-900">{order.order_number}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-dark-500">
                      Placed on {formatDateShort(order.created_at)}
                    </p>
                    <p className="text-sm text-dark-500 mt-0.5">
                      {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                      · {order.payment_method === 'COD' ? 'Cash on Delivery' : 'Bank Transfer'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-dark-900">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <span className="text-xs text-primary-600 font-medium">View Details →</span>
                  </div>
                </div>

                {/* Items preview */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dark-100">
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item) => (
                        <span key={item.id} className="text-xs bg-dark-50 text-dark-600 px-2 py-1 rounded-md">
                          {item.product_name_snapshot} × {item.quantity}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs bg-dark-50 text-dark-400 px-2 py-1 rounded-md">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </Link>
          ))}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            pageSize={10}
          />
        </div>
      )}
    </div>
  )
}
