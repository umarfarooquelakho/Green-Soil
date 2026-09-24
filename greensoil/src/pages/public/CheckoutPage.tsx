import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, CreditCard, Truck, ShoppingBag } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { orderService } from '@/services/orderService'
import { formatCurrency, getPrimaryImage } from '@/lib/utils'
import { PAKISTAN_PROVINCES } from '@/lib/constants'
import toast from 'react-hot-toast'

const schema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Valid email required'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postal_code: z.string().optional(),
  payment_method: z.enum(['COD', 'BANK_TRANSFER']),
  customer_notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const provinceOptions = PAKISTAN_PROVINCES.map((p) => ({ value: p, label: p }))

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: user?.profile?.full_name ?? '',
      email: user?.email ?? '',
      phone: user?.profile?.phone ?? '',
      payment_method: 'COD',
    },
  })

  if (!user) {
    navigate('/login', { state: { from: '/checkout' } })
    return null
  }

  if (items.length === 0 && !orderSuccess) {
    navigate('/cart')
    return null
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const order = await orderService.createOrder(
        {
          shipping_address: {
            full_name: data.full_name,
            phone: data.phone,
            address_line1: data.address_line1,
            address_line2: data.address_line2,
            city: data.city,
            province: data.province,
            country: 'Pakistan',
            postal_code: data.postal_code,
          },
          payment_method: data.payment_method,
          customer_notes: data.customer_notes,
          cart_items: items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        },
        user.id
      )
      setOrderSuccess(order.order_number)
      toast.success('Order placed successfully!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to place order'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-dark-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-dark-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Order Placed!</h2>
          <p className="text-dark-500 mb-4">
            Your order has been received and is being processed.
          </p>
          <div className="bg-primary-50 rounded-xl p-4 mb-6 border border-primary-100">
            <p className="text-sm text-dark-500">Order Number</p>
            <p className="text-xl font-bold text-primary-700">{orderSuccess}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/account/orders')}>
              Track My Order
            </Button>
            <Button variant="outline" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter min-h-screen bg-dark-50">
      <div className="bg-white border-b border-dark-100 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
          <h1 className="text-2xl font-bold text-dark-900 mt-2">Checkout</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping info */}
              <div className="bg-white rounded-xl border border-dark-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-bold text-dark-900">Shipping Information</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      required
                      error={errors.full_name?.message}
                      {...register('full_name')}
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      required
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    required
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <Input
                    label="Address Line 1"
                    required
                    placeholder="Street address, P.O. box, company"
                    error={errors.address_line1?.message}
                    {...register('address_line1')}
                  />
                  <Input
                    label="Address Line 2"
                    placeholder="Apartment, suite, unit (optional)"
                    {...register('address_line2')}
                  />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      required
                      error={errors.city?.message}
                      {...register('city')}
                    />
                    <Select
                      label="Province"
                      required
                      options={provinceOptions}
                      placeholder="Select"
                      error={errors.province?.message}
                      {...register('province')}
                    />
                    <Input
                      label="Postal Code"
                      {...register('postal_code')}
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-xl border border-dark-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-bold text-dark-900">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  {[
                    { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                    { value: 'BANK_TRANSFER', label: 'Bank Transfer', desc: 'Transfer to our bank account before delivery' },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer hover:border-primary-300 transition-colors has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
                    >
                      <input
                        type="radio"
                        value={method.value}
                        {...register('payment_method')}
                        className="mt-1 accent-primary-600"
                      />
                      <div>
                        <p className="font-semibold text-dark-900">{method.label}</p>
                        <p className="text-sm text-dark-500">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl border border-dark-100 p-6">
                <Textarea
                  label="Order Notes (Optional)"
                  placeholder="Special instructions for your order..."
                  rows={3}
                  {...register('customer_notes')}
                />
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-dark-100 p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-primary-600" />
                  </div>
                  <h2 className="text-lg font-bold text-dark-900">Order Summary</h2>
                </div>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex gap-3">
                      <img
                        src={getPrimaryImage(item.product?.images)}
                        alt={item.product?.name}
                        className="w-12 h-12 rounded-lg object-cover border border-dark-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark-800 line-clamp-1">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-dark-400">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-dark-900">
                          {formatCurrency((item.product?.price ?? 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-dark-100 pt-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-500">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-500">Shipping</span>
                    <span className="text-dark-600">Calculated</span>
                  </div>
                </div>

                <div className="border-t border-dark-100 pt-4 mb-6">
                  <div className="flex justify-between font-bold text-dark-900">
                    <span>Total</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  loading={submitting}
                >
                  Place Order
                </Button>
                <p className="text-xs text-dark-400 text-center mt-3">
                  🔒 Your information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
