import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Package,
  Truck,
  Shield,
  Play,
} from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProductCard } from '@/components/shared/ProductCard'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { ErrorState } from '@/components/ui/EmptyState'
import { productService } from '@/services/productService'
import type { Product } from '@/types/product.types'
import { useCart } from '@/contexts/CartContext'
import {
  formatCurrency,
  calculateDiscount,
  getYouTubeEmbedUrl,
  getInventoryStatus,
} from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'benefits' | 'usage' | 'specs'>('description')
  const [addingToCart, setAddingToCart] = useState(false)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(false)

    productService.getProductBySlug(slug).then((p) => {
      if (!p) { setError(true); setLoading(false); return }
      setProduct(p)
      setLoading(false)
      // Load related
      productService.getRelatedProducts(p.id, p.category_id, 4).then(setRelatedProducts)
    })
  }, [slug])

  const handleAddToCart = async () => {
    if (!product) return
    setAddingToCart(true)
    await addItem(product.id, quantity)
    toast.success(`${product.name} added to cart`)
    setAddingToCart(false)
  }

  const handleBuyNow = async () => {
    if (!product) return
    setAddingToCart(true)
    await addItem(product.id, quantity)
    setAddingToCart(false)
    navigate('/cart')
  }

  if (loading) return <PageLoading />
  if (error || !product) {
    return (
      <ErrorState
        title="Product Not Found"
        description="The product you are looking for does not exist or has been removed."
        onRetry={() => navigate('/products')}
      />
    )
  }

  const images = product.images ?? []
  const discount = product.compare_at_price
    ? calculateDiscount(product.price, product.compare_at_price)
    : 0
  const inventoryStatus = getInventoryStatus(product.stock_quantity, product.low_stock_threshold)
  const isOutOfStock = inventoryStatus === 'OUT_OF_STOCK'
  const isLowStock = inventoryStatus === 'LOW_STOCK'

  const tabs = [
    { key: 'description', label: 'Description', show: !!product.description },
    { key: 'benefits', label: 'Benefits', show: !!(product.benefits?.length) },
    { key: 'usage', label: 'Usage', show: !!product.usage_instructions },
    { key: 'specs', label: 'Specifications', show: !!product.specifications },
  ].filter((t) => t.show)

  return (
    <div className="page-enter min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-dark-50 border-b border-dark-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb
            items={[
              { label: 'Products', href: '/products' },
              ...(product.category ? [{ label: product.category.name, href: `/products?category=${product.category.slug}` }] : []),
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Product main */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div>
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-50 border border-dark-100 mb-3">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]?.url}
                  alt={images[selectedImage]?.alt_text ?? product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dark-300">
                  <Package className="w-24 h-24" />
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge variant="danger" size="lg">-{discount}%</Badge>
                </div>
              )}
              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((i) => (i > 0 ? i - 1 : images.length - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((i) => (i < images.length - 1 ? i + 1 : 0))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? 'border-primary-600' : 'border-dark-200 hover:border-dark-400'
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img.url} alt={img.alt_text ?? ''} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            {product.category && (
              <p className="text-sm text-primary-600 font-semibold uppercase tracking-wide mb-2">
                {product.category.name}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 mb-2">
              {product.name}
            </h1>

            {/* SKU + packaging */}
            <div className="flex flex-wrap gap-3 text-sm text-dark-500 mb-4">
              <span>SKU: <strong>{product.sku}</strong></span>
              {product.packaging_size && (
                <span>Pack: <strong>{product.packaging_size}</strong></span>
              )}
              {product.brand && <span>Brand: <strong>{product.brand}</strong></span>}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-dark-900">
                {formatCurrency(product.price)}
              </span>
              {product.compare_at_price && (
                <span className="text-lg text-dark-400 line-through">
                  {formatCurrency(product.compare_at_price)}
                </span>
              )}
              {discount > 0 && (
                <Badge variant="danger">Save {discount}%</Badge>
              )}
            </div>

            {/* Stock status */}
            <div className="mb-6">
              {isOutOfStock ? (
                <Badge variant="default" size="lg" dot>Out of Stock</Badge>
              ) : isLowStock ? (
                <Badge variant="warning" size="lg" dot>
                  Low Stock — Only {product.stock_quantity} left
                </Badge>
              ) : (
                <Badge variant="success" size="lg" dot>In Stock</Badge>
              )}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-dark-600 mb-6 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Quantity + Add to cart */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-dark-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-dark-600 hover:bg-dark-50 transition-colors text-lg font-medium"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-dark-900 font-semibold min-w-[48px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock_quantity, q + 1))
                    }
                    className="px-3 py-2 text-dark-600 hover:bg-dark-50 transition-colors text-lg font-medium"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-8">
              <Button
                size="lg"
                leftIcon={<ShoppingCart className="w-5 h-5" />}
                onClick={handleAddToCart}
                loading={addingToCart}
                disabled={isOutOfStock}
                className="flex-1"
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              {!isOutOfStock && (
                <Button
                  size="lg"
                  variant="secondary"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  onClick={handleBuyNow}
                  disabled={addingToCart}
                  className="flex-1"
                >
                  Buy Now
                </Button>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-dark-100">
              {[
                { icon: Shield, label: 'Quality Guaranteed' },
                { icon: Truck, label: 'Nationwide Delivery' },
                { icon: Check, label: 'Authentic Products' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                  <p className="text-xs text-dark-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 0 && (
          <div className="border-t border-dark-100 pt-10 mb-16">
            <div className="flex gap-1 border-b border-dark-100 mb-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary-600 text-primary-700'
                      : 'border-transparent text-dark-500 hover:text-dark-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="max-w-3xl">
              {activeTab === 'description' && (
                <div className="prose prose-sm text-dark-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              )}
              {activeTab === 'benefits' && product.benefits && (
                <ul className="space-y-3">
                  {product.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                      <span className="text-dark-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'usage' && (
                <div className="text-dark-600 leading-relaxed whitespace-pre-line">
                  {product.usage_instructions}
                </div>
              )}
              {activeTab === 'specs' && product.specifications && (
                <div className="overflow-x-auto rounded-xl border border-dark-100">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? 'bg-dark-50' : 'bg-white'}>
                          <td className="px-4 py-3 font-medium text-dark-700 w-1/3">{key}</td>
                          <td className="px-4 py-3 text-dark-600">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product videos */}
        {product.videos && product.videos.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-bold text-dark-900 mb-6">Product Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.videos
                .filter((v) => v.status === 'PUBLISHED')
                .map((video) => (
                  <div
                    key={video.id}
                    className="group relative rounded-xl overflow-hidden bg-dark-900 cursor-pointer aspect-video"
                    onClick={() => setActiveVideoId(activeVideoId === video.id ? null : video.id)}
                  >
                    {activeVideoId === video.id ? (
                      <iframe
                        src={`${getYouTubeEmbedUrl(video.youtube_url)}?autoplay=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <>
                        <img
                          src={video.thumbnail_url ?? ''}
                          alt={video.title}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-5 h-5 text-primary-700 ml-0.5" />
                          </div>
                        </div>
                        <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium line-clamp-2">
                          {video.title}
                        </p>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-dark-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
