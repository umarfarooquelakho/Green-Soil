import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Leaf,
  Award,
  Truck,
  Users,
  Phone,
  Star,
  CheckCircle,
  Play,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/shared/ProductCard'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { contentService } from '@/services/contentService'
import type { Product, ProductCategory } from '@/types/product.types'
import type { Service, Video } from '@/services/contentService'
import { getYouTubeThumbnail, getYouTubeEmbedUrl } from '@/lib/utils'

const stats = [
  { label: 'Farmers Served', value: '5,000+', icon: Users },
  { label: 'Products Available', value: '50+', icon: Leaf },
  { label: 'Years of Experience', value: '5+', icon: Award },
  { label: 'Districts Covered', value: '20+', icon: Truck },
]

const whyChooseUs = [
  { title: 'Premium Quality', desc: 'All products meet international quality standards and are tested for effectiveness.' },
  { title: 'Expert Support', desc: 'Our agricultural consultants are available to help you choose the right products.' },
  { title: 'Nationwide Delivery', desc: 'We deliver across Pakistan ensuring your products reach you on time.' },
  { title: 'Trusted Brand', desc: 'Trusted by thousands of farmers and agri businesses across Pakistan.' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const [featRes, catRes, svcRes, vidRes] = await Promise.all([
        productService.getFeaturedProducts(8),
        categoryService.getCategories(),
        contentService.getServices(),
        contentService.getVideos(),
      ])
      setFeaturedProducts(featRes)
      setCategories(catRes)
      setServices(svcRes.slice(0, 6))
      setVideos(vidRes.slice(0, 3))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <PageLoading />

  return (
    <div className="page-enter">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary-400 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary-300 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500 blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-800/60 text-primary-200 rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-primary-700">
              <Leaf className="w-4 h-4" />
              Pakistan's Trusted Agri Partner
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Grow Better With{' '}
              <span className="text-primary-300">GREEN SOIL</span>{' '}
              Fertilizers
            </h1>
            <p className="text-lg text-primary-200 mb-8 max-w-xl leading-relaxed">
              Premium quality fertilizers and agricultural solutions designed to maximize
              your crop yield. Trusted by over 5,000 farmers across Pakistan.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-primary-800 hover:bg-primary-50 shadow-xl"
                onClick={() => navigate('/products')}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Explore Products
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-400 text-white hover:bg-primary-800/50"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mt-10">
              {['ISO Certified', 'Government Approved', '100% Authentic'].map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-primary-200 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary-400" />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="w-80 h-80 rounded-full bg-primary-700/30 border border-primary-600/50 flex items-center justify-center">
                <div className="w-60 h-60 rounded-full bg-primary-600/40 border border-primary-500/50 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full bg-primary-500/50 flex items-center justify-center">
                    <Leaf className="w-20 h-20 text-primary-200" />
                  </div>
                </div>
              </div>
              {/* Floating cards */}
              {[
                { label: 'Products', value: '50+', pos: 'top-4 -left-8' },
                { label: 'Farmers', value: '5K+', pos: 'bottom-4 -right-8' },
                { label: 'Districts', value: '20+', pos: 'top-1/2 -right-16' },
              ].map((card) => (
                <div
                  key={card.label}
                  className={`absolute ${card.pos} bg-white rounded-xl p-3 shadow-xl text-center min-w-[80px]`}
                >
                  <p className="text-lg font-bold text-primary-700">{card.value}</p>
                  <p className="text-xs text-dark-500">{card.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C240,20 480,0 720,20 C960,40 1200,60 1440,40 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-dark-900 mb-1">{stat.value}</p>
                <p className="text-sm text-dark-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-dark-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-2">
                  Our Products
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-dark-900">
                  Featured Products
                </h2>
              </div>
              <Link
                to="/products"
                className="hidden sm:flex items-center gap-2 text-primary-700 hover:text-primary-800 font-medium text-sm transition-colors"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-10 sm:hidden">
              <Button variant="outline" onClick={() => navigate('/products')}>
                View All Products
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ═══ CATEGORIES ═══ */}
      {categories.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-2">
                Browse By Category
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-dark-900">
                Product Categories
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="group bg-primary-50 hover:bg-primary-100 rounded-2xl p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md border border-primary-100 hover:border-primary-200"
                >
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-16 h-16 object-cover rounded-xl mx-auto mb-3"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary-200 flex items-center justify-center mx-auto mb-3">
                      <Leaf className="w-8 h-8 text-primary-600" />
                    </div>
                  )}
                  <h3 className="font-semibold text-dark-800 text-sm group-hover:text-primary-700 transition-colors">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ SERVICES ═══ */}
      {services.length > 0 && (
        <section className="py-20 bg-dark-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-2">
                  What We Offer
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-dark-900">Our Services</h2>
              </div>
              <Link
                to="/services"
                className="hidden sm:flex items-center gap-2 text-primary-700 font-medium text-sm"
              >
                All Services <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-6 border border-dark-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.title}
                      className="w-12 h-12 rounded-xl object-cover mb-4"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4">
                      <Leaf className="w-6 h-6 text-primary-600" />
                    </div>
                  )}
                  <h3 className="font-bold text-dark-900 mb-2">{service.title}</h3>
                  <p className="text-sm text-dark-500 leading-relaxed">
                    {service.short_description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ WHY CHOOSE US ═══ */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-primary-300 font-semibold text-sm uppercase tracking-widest mb-2">
              Our Promise
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">Why Choose GREEN SOIL?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary-700 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-primary-300" />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-primary-300 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VIDEOS ═══ */}
      {videos.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-primary-600 font-semibold text-sm uppercase tracking-widest mb-2">
                  Learn More
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-dark-900">Product Videos</h2>
              </div>
              <Link
                to="/videos"
                className="hidden sm:flex items-center gap-2 text-primary-700 font-medium text-sm"
              >
                All Videos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => {
                const thumb =
                  video.thumbnail_url || getYouTubeThumbnail(video.youtube_url)
                const embedUrl = getYouTubeEmbedUrl(video.youtube_url)

                return (
                  <div
                    key={video.id}
                    className="group relative rounded-2xl overflow-hidden bg-dark-900 cursor-pointer"
                    onClick={() => setActiveVideo(activeVideo === video.id ? null : video.id)}
                  >
                    {activeVideo === video.id ? (
                      <iframe
                        src={`${embedUrl}?autoplay=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full aspect-video"
                      />
                    ) : (
                      <>
                        <img
                          src={thumb}
                          alt={video.title}
                          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-primary-700 ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80">
                          <h3 className="text-white font-semibold text-sm line-clamp-2">
                            {video.title}
                          </h3>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CTA ═══ */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 mb-4">
            Ready to Grow Better Crops?
          </h2>
          <p className="text-dark-500 text-lg mb-8">
            Explore our full range of fertilizers and agricultural products. Our team is ready to help you find the perfect solution.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/products')}>
              Shop Now
            </Button>
            <Button size="lg" variant="outline" leftIcon={<Phone className="w-5 h-5" />} onClick={() => navigate('/contact')}>
              Talk to an Expert
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
