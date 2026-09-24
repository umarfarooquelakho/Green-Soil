import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/shared/ProductCard'
import { Pagination } from '@/components/ui/Pagination'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import type { Product, ProductCategory } from '@/types/product.types'
import { Package } from 'lucide-react'
import { ITEMS_PER_PAGE } from '@/lib/constants'

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A – Z' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const page = Number(searchParams.get('page') ?? 1)
  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const sort = searchParams.get('sort') ?? 'newest'

  const getSortParams = (sortVal: string) => {
    switch (sortVal) {
      case 'price_asc': return { field: 'price', order: 'asc' as const }
      case 'price_desc': return { field: 'price', order: 'desc' as const }
      case 'name_asc': return { field: 'name', order: 'asc' as const }
      default: return { field: 'created_at', order: 'desc' as const }
    }
  }

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const sortParams = getSortParams(sort)
      // Find category_id from slug
      let categoryId: string | undefined
      if (category) {
        const cat = categories.find((c) => c.slug === category)
        categoryId = cat?.id
      }
      const result = await productService.getProducts(
        { search: search || undefined, category_id: categoryId },
        page,
        ITEMS_PER_PAGE,
        sortParams.field,
        sortParams.order
      )
      setProducts(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } finally {
      setLoading(false)
    }
  }, [search, category, sort, page, categories])

  useEffect(() => {
    categoryService.getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== 'page') params.set('page', '1')
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearchParams({ page: '1' })
  }

  const hasFilters = search || category

  return (
    <div className="page-enter min-h-screen bg-dark-50">
      {/* Page header */}
      <div className="bg-white border-b border-dark-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: 'Products' }]} />
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 mt-3">
            Our Products
          </h1>
          <p className="text-dark-500 mt-1">
            Premium fertilizers and agricultural solutions for your farm
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters bar */}
        <div className="bg-white rounded-xl border border-dark-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={(e) => updateParam('search', e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Category filter */}
            <div className="sm:w-48">
              <Select
                value={category}
                onChange={(e) => updateParam('category', e.target.value)}
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map((c) => ({ value: c.slug, label: c.name })),
                ]}
                placeholder="All Categories"
              />
            </div>

            {/* Sort */}
            <div className="sm:w-48">
              <Select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                options={sortOptions}
              />
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                size="md"
                onClick={clearFilters}
                leftIcon={<X className="w-4 h-4" />}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-dark-500 mb-6">
            {total === 0 ? 'No products found' : `Showing ${total} product${total !== 1 ? 's' : ''}`}
            {search && <span> for "<strong>{search}</strong>"</span>}
          </p>
        )}

        {/* Products grid */}
        {loading ? (
          <PageLoading />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="No products found"
            description="Try adjusting your search or filter criteria."
            action={{ label: 'Clear Filters', onClick: clearFilters }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => updateParam('page', String(p))}
              total={total}
              pageSize={ITEMS_PER_PAGE}
            />
          </>
        )}
      </div>
    </div>
  )
}
