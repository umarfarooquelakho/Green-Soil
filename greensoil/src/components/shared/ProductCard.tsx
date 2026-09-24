import { Link } from 'react-router-dom'
import { ShoppingCart, Eye, Star } from 'lucide-react'
import { cn, formatCurrency, getPrimaryImage, calculateDiscount } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useCart } from '@/contexts/CartContext'
import type { Product } from '@/types/product.types'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, hasItem } = useCart()
  const imageUrl = getPrimaryImage(product.images)
  const discount = product.compare_at_price
    ? calculateDiscount(product.price, product.compare_at_price)
    : 0
  const isOutOfStock = product.stock_quantity <= 0
  const inCart = hasItem(product.id)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    await addItem(product.id, 1)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className={cn(
        'group bg-white rounded-xl border border-dark-100 overflow-hidden',
        'hover:shadow-lg hover:-translate-y-1 transition-all duration-200',
        'flex flex-col',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-dark-50 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-product.jpg'
          }}
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.featured && (
            <Badge variant="primary" size="sm">
              <Star className="w-3 h-3" /> Featured
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="danger" size="sm">
              -{discount}%
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="default" size="sm">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white rounded-lg shadow-lg p-1 flex gap-1">
            <button
              className="p-2 text-dark-600 hover:text-primary-600 transition-colors"
              aria-label="Quick view"
              onClick={(e) => e.preventDefault()}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <p className="text-xs text-primary-600 font-medium mb-1 uppercase tracking-wide">
            {product.category.name}
          </p>
        )}
        <h3 className="text-sm font-semibold text-dark-900 line-clamp-2 mb-1 group-hover:text-primary-700 transition-colors">
          {product.name}
        </h3>
        {product.packaging_size && (
          <p className="text-xs text-dark-400 mb-2">{product.packaging_size}</p>
        )}
        <p className="text-xs text-dark-500 line-clamp-2 mb-3 flex-1">
          {product.short_description}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-bold text-dark-900">
            {formatCurrency(product.price)}
          </span>
          {product.compare_at_price && (
            <span className="text-xs text-dark-400 line-through">
              {formatCurrency(product.compare_at_price)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <Button
          variant={inCart ? 'secondary' : 'primary'}
          size="sm"
          fullWidth
          leftIcon={<ShoppingCart className="w-3.5 h-3.5" />}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="mt-auto"
        >
          {isOutOfStock ? 'Out of Stock' : inCart ? 'In Cart' : 'Add to Cart'}
        </Button>
      </div>
    </Link>
  )
}
