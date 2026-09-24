import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingCart, ArrowRight, Plus, Minus } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCart } from '@/contexts/CartContext'
import { formatCurrency, getPrimaryImage } from '@/lib/utils'

export default function CartPage() {
  const { items, itemCount, subtotal, removeItem, updateQuantity, clearCart } = useCart()
  const navigate = useNavigate()

  const shippingNote = subtotal >= 5000 ? 'Free Shipping' : 'Calculated at checkout'

  if (itemCount === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          icon={<ShoppingCart className="w-8 h-8" />}
          title="Your cart is empty"
          description="Browse our products and add items to your cart."
          action={{ label: 'Shop Now', onClick: () => navigate('/products') }}
        />
      </div>
    )
  }

  return (
    <div className="page-enter min-h-screen bg-dark-50">
      <div className="bg-white border-b border-dark-100 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: 'Cart' }]} />
          <h1 className="text-2xl font-bold text-dark-900 mt-2">
            Shopping Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clear cart */}
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-700 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Clear Cart
              </button>
            </div>

            {items.map((item) => {
              const imageUrl = getPrimaryImage(item.product?.images)
              const itemPrice = item.product?.price ?? 0
              const maxQty = item.product?.stock_quantity ?? 99

              return (
                <div key={item.product_id} className="bg-white rounded-xl border border-dark-100 p-4 flex gap-4">
                  {/* Image */}
                  <Link to={`/products/${item.product?.slug}`} className="shrink-0">
                    <img
                      src={imageUrl}
                      alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded-lg border border-dark-100"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product?.slug}`}
                      className="font-semibold text-dark-900 hover:text-primary-700 transition-colors line-clamp-2"
                    >
                      {item.product?.name}
                    </Link>
                    <p className="text-xs text-dark-400 mt-0.5">SKU: {item.product?.sku}</p>
                    <p className="text-primary-700 font-bold mt-1">{formatCurrency(itemPrice)}</p>

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-dark-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="px-2.5 py-1.5 text-dark-600 hover:bg-dark-50 transition-colors"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-semibold min-w-[36px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, Math.min(maxQty, item.quantity + 1))}
                          className="px-2.5 py-1.5 text-dark-600 hover:bg-dark-50 transition-colors"
                          aria-label="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-dark-900">
                          {formatCurrency(itemPrice * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors mt-2"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-dark-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-dark-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">
                    Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})
                  </span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Shipping</span>
                  <span className="font-medium text-emerald-600">{shippingNote}</span>
                </div>
              </div>

              <div className="border-t border-dark-100 pt-4 mb-6">
                <div className="flex justify-between font-bold text-dark-900">
                  <span>Estimated Total</span>
                  <span className="text-lg">{formatCurrency(subtotal)}</span>
                </div>
                <p className="text-xs text-dark-400 mt-1">
                  Final total calculated at checkout
                </p>
              </div>

              <Button
                size="lg"
                fullWidth
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>

              <div className="mt-4 text-center text-xs text-dark-400">
                🔒 Secure checkout · Cash on Delivery available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
