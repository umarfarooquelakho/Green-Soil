import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { ErrorState } from '@/components/ui/EmptyState'
import { orderService } from '@/services/orderService'
import type { Order } from '@/types/order.types'
import type { OrderStatus } from '@/types/database.types'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { ORDER_STATUSES, PAYMENT_METHODS } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('')

  useEffect(() => {
    if (!id) return
    orderService.getOrderById(id).then((o) => {
      setOrder(o)
      setNewStatus(o?.status ?? '')
      setLoading(false)
    })
  }, [id])

  const handleStatusUpdate = async () => {
    if (!order || !newStatus || newStatus === order.status) return
    setUpdating(true)
    try {
      await orderService.updateOrderStatus(order.id, newStatus as OrderStatus)
      setOrder((prev) => prev ? { ...prev, status: newStatus as OrderStatus } : prev)
      toast.success('Order status updated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <PageLoading />
  if (!order) return <ErrorState title="Order not found" onRetry={() => navigate('/admin/orders')} />

  const addr = order.shipping_address as Record<string, string>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/admin/orders')}>
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-dark-900">{order.order_number}</h1>
            <p className="text-sm text-dark-500">{formatDateTime(order.created_at)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" leftIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
            Print
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="bg-white rounded-xl border border-dark-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-100">
              <h2 className="font-bold text-dark-900">Order Items</h2>
            </div>
            <div className="divide-y divide-dark-50">
              {order.items?.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-dark-900">{item.product_name_snapshot}</p>
                    <p className="text-xs text-dark-400">SKU: {item.sku_snapshot}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-dark-500">{formatCurrency(item.unit_price_snapshot)} × {item.quantity}</p>
                    <p className="font-bold text-dark-900">{formatCurrency(item.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="px-6 py-4 bg-dark-50 border-t border-dark-100 space-y-2">
              {[
                { label: 'Subtotal', value: order.subtotal },
                { label: 'Shipping', value: order.shipping_amount },
                { label: 'Discount', value: -order.discount_amount },
                { label: 'Tax', value: order.tax_amount },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-dark-500">{label}</span>
                  <span className={value < 0 ? 'text-emerald-600' : ''}>{value < 0 ? '-' : ''}{formatCurrency(Math.abs(value))}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-dark-900 pt-2 border-t border-dark-200">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white rounded-xl border border-dark-100 p-6">
            <h2 className="font-bold text-dark-900 mb-4">Shipping Address</h2>
            <div className="text-sm text-dark-600 space-y-1">
              <p className="font-semibold text-dark-900">{addr.full_name}</p>
              <p>{addr.phone}</p>
              <p>{addr.address_line1}</p>
              {addr.address_line2 && <p>{addr.address_line2}</p>}
              <p>{addr.city}, {addr.province}</p>
              <p>{addr.country} {addr.postal_code}</p>
            </div>
          </div>

          {/* Notes */}
          {order.customer_notes && (
            <div className="bg-white rounded-xl border border-dark-100 p-6">
              <h2 className="font-bold text-dark-900 mb-2">Customer Notes</h2>
              <p className="text-sm text-dark-600">{order.customer_notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl border border-dark-100 p-6">
            <h2 className="font-bold text-dark-900 mb-4">Order Status</h2>
            <div className="mb-4">
              <OrderStatusBadge status={order.status} />
            </div>
            <Select
              label="Update Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              options={ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            />
            <Button
              className="mt-3"
              fullWidth
              size="sm"
              onClick={handleStatusUpdate}
              loading={updating}
              disabled={!newStatus || newStatus === order.status}
            >
              Update Status
            </Button>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-dark-100 p-6">
            <h2 className="font-bold text-dark-900 mb-4">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-500">Method</span>
                <span className="font-medium">
                  {PAYMENT_METHODS.find((m) => m.value === order.payment_method)?.label ?? order.payment_method}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-500">Status</span>
                <PaymentStatusBadge status={order.payment_status} />
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-xl border border-dark-100 p-6">
            <h2 className="font-bold text-dark-900 mb-4">Customer</h2>
            <div className="text-sm text-dark-600 space-y-1">
              <p className="font-semibold text-dark-900">{addr.full_name}</p>
              <p>{addr.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
