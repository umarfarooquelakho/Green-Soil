import { supabase } from '@/lib/supabase'
import type { Product, ProductFilters, CreateProductInput } from '@/types/product.types'
import type { PaginatedResult } from '@/types/common.types'

const PRODUCT_SELECT = `
  id, name, slug, sku, category_id, short_description, description,
  price, compare_at_price, cost_price,
  stock_quantity, reserved_quantity, low_stock_threshold,
  packaging_size, unit, brand, status, featured,
  benefits, usage_instructions, composition, specifications,
  created_at, updated_at, deleted_at,
  product_categories (id, name, slug),
  product_images (id, url, alt_text, sort_order, is_primary)
`

export const productService = {
  async getProducts(
    filters: ProductFilters = {},
    page = 1,
    pageSize = 12,
    sortField = 'created_at',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<PaginatedResult<Product>> {
    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT, { count: 'exact' })
      .is('deleted_at', null)

    // Filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    } else {
      // Public facing — only published
      query = query.eq('status', 'PUBLISHED')
    }
    if (filters.category_id) query = query.eq('category_id', filters.category_id)
    if (filters.featured !== undefined) query = query.eq('featured', filters.featured)
    if (filters.min_price !== undefined) query = query.gte('price', filters.min_price)
    if (filters.max_price !== undefined) query = query.lte('price', filters.max_price)
    if (filters.in_stock) query = query.gt('stock_quantity', 0)
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`
      )
    }

    // Sort & paginate
    query = query
      .order(sortField, { ascending: sortOrder === 'asc' })
      .range((page - 1) * pageSize, page * pageSize - 1)

    const { data, error, count } = await query

    if (error) throw new Error(error.message)

    const products = (data ?? []).map(mapProduct)
    const total = count ?? 0

    return {
      data: products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        ${PRODUCT_SELECT},
        product_videos (id, title, youtube_url, thumbnail_url, status)
      `)
      .eq('slug', slug)
      .is('deleted_at', null)
      .single()

    if (error || !data) return null
    return mapProduct(data)
  },

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`${PRODUCT_SELECT}, product_videos (id, title, youtube_url, thumbnail_url, status)`)
      .eq('id', id)
      .single()

    if (error || !data) return null
    return mapProduct(data)
  },

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('status', 'PUBLISHED')
      .eq('featured', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return []
    return (data ?? []).map(mapProduct)
  },

  async getRelatedProducts(productId: string, categoryId: string | null, limit = 4): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('status', 'PUBLISHED')
      .is('deleted_at', null)
      .neq('id', productId)
      .limit(limit)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data } = await query
    return (data ?? []).map(mapProduct)
  },

  // Admin: get all products including drafts
  async getAllProducts(
    filters: ProductFilters & { adminView?: boolean } = {},
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResult<Product>> {
    let query = supabase
      .from('products')
      .select(PRODUCT_SELECT, { count: 'exact' })
      .is('deleted_at', null)

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.category_id) query = query.eq('category_id', filters.category_id)
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
    }

    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    const { data, error, count } = await query
    if (error) throw new Error(error.message)

    return {
      data: (data ?? []).map(mapProduct),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    }
  },

  async createProduct(input: CreateProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...input,
        stock_quantity: input.stock_quantity ?? 0,
        reserved_quantity: 0,
        low_stock_threshold: input.low_stock_threshold ?? 10,
        featured: input.featured ?? false,
      })
      .select(PRODUCT_SELECT)
      .single()

    if (error) throw new Error(error.message)
    return mapProduct(data)
  },

  async updateProduct(id: string, input: Partial<CreateProductInput>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(PRODUCT_SELECT)
      .single()

    if (error) throw new Error(error.message)
    return mapProduct(data)
  },

  async archiveProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString(), status: 'ARCHIVED' })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  async uploadProductImage(
    productId: string,
    file: File,
    isPrimary = false
  ): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${productId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: false })

    if (uploadError) throw new Error(uploadError.message)

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    // Save to product_images table
    const { error: dbError } = await supabase.from('product_images').insert({
      product_id: productId,
      url: publicUrl,
      is_primary: isPrimary,
      sort_order: 0,
    })

    if (dbError) throw new Error(dbError.message)

    return publicUrl
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(data: any): Product {
  return {
    ...data,
    category: data.product_categories ?? null,
    images: data.product_images ?? [],
    videos: data.product_videos ?? [],
    benefits: Array.isArray(data.benefits) ? data.benefits : null,
    specifications:
      data.specifications && typeof data.specifications === 'object'
        ? data.specifications
        : null,
  }
}
