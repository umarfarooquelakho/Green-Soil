import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { ErrorState } from '@/components/ui/EmptyState'
import { orderService } from '@/services/orderService'
import type { Order } from '@/types/order.types'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { PAYMENT_METHODS } from '@/lib/constants'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    orderService.getOrderById(id).then((o) => { setOrder(o); setLoading(false) })
  }, [id])

  if (loading) return <PageLoading />
  if (!order) return <ErrorState title="Order not found" />

  const addr = order.shipping_address as Record<string, string>

  const steps = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED']
  const currentStep = steps.indexOf(order.status)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/account/orders" className="text-dark-500 hover:text-dark-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-dark-900">{order.order_number}</h1>
          <p className="text-sm text-dark-500">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="ml-auto">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Progress tracker */}
      {!['CANCELLED','RETURNED'].includes(order.status) && (
        <div className="bg-white rounded-xl border border-dark-100 p-6 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-dark-100 z-0" />
            <div
              className="absolute left-0 top-4 h-0.5 bg-primary-600 z-0 transition-all"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((step, idx) => {
              const done = idx <= currentStep
              return (
                <div key={step} className="flex flex-col items-center z-10 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${done ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-dark-200 text-dark-400'}`}>
                    {idx + 1}
                  </div>
                  <p className="text-xs mt-2 text-dark-500 hidden sm:block">{step.charAt(0) + step.slice(1).toLowerCase()}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div className="bg-white rounded-xl border border-dark-100 overflow-hidden">
            <h2 className="font-bold text-dark-900 px-5 py-4 border-b border-dark-100">Order Items</h2>
            {order.items?.map((item) => (
              <div key={item.id} className="px-5 py-4 flex justify-between items-center border-b last:border-0 border-dark-50">
                <div>
                  <p className="font-medium text-dark-900">{item.product_name_snapshot}</p>
                  <p className="text-xs text-dark-400">SKU: {item.sku_snapshot} · Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-dark-900">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
            {/* Totals */}
            <div className="px-5 py-4 bg-dark-50 space-y-2">
              {[
                { l: 'Subtotal', v: order.subtotal },
                { l: 'Shipping', v: order.shipping_amount },
                { l: 'Tax', v: order.tax_amount },
              ].map(({ l, v }) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-dark-500">{l}</span>
                  <span>{formatCurrency(v)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-dark-900 pt-2 border-t border-dark-200">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-xl border border-dark-100 p-5">
            <h2 className="font-bold text-dark-900 mb-3">Shipping Address</h2>
            <p className="text-sm text-dark-600">{addr.full_name}</p>
            <p className="text-sm text-dark-600">{addr.phone}</p>
            <p className="text-sm text-dark-600">{addr.address_line1}</p>
            <p className="text-sm text-dark-600">{addr.city}, {addr.province}</p>
            <p className="text-sm text-dark-600">{addr.country}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-dark-100 p-5">
            <h2 className="font-bold text-dark-900 mb-3">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-500">Method</span>
                <span>{PAYMENT_METHODS.find((m) => m.value === order.payment_method)?.label ?? order.payment_method}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-500">Status</span>
                <PaymentStatusBadge status={order.payment_status} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
