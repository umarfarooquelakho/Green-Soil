import type { ProductStatus } from './database.types'

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  category_id: string | null
  category?: ProductCategory
  short_description: string | null
  description: string | null
  price: number
  compare_at_price: number | null
  cost_price: number | null
  stock_quantity: number
  reserved_quantity: number
  low_stock_threshold: number
  packaging_size: string | null
  unit: string | null
  brand: string | null
  status: ProductStatus
  featured: boolean
  benefits: string[] | null
  usage_instructions: string | null
  composition: string | null
  specifications: Record<string, string> | null
  images?: ProductImage[]
  videos?: ProductVideo[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  icon: string | null
  parent_id: string | null
  sort_order: number
  status: 'ACTIVE' | 'INACTIVE'
  created_at: string
  updated_at: string
  deleted_at: string | null
  _count?: { products: number }
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
  created_at: string
}

export interface ProductVideo {
  id: string
  product_id: string | null
  title: string
  description: string | null
  youtube_url: string
  thumbnail_url: string | null
  category: string | null
  status: 'PUBLISHED' | 'DRAFT'
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ProductFilters {
  search?: string
  category_id?: string
  status?: ProductStatus
  featured?: boolean
  min_price?: number
  max_price?: number
  in_stock?: boolean
}

export type ProductSortField = 'created_at' | 'name' | 'price' | 'stock_quantity'

export interface CreateProductInput {
  name: string
  slug: string
  sku: string
  category_id?: string
  short_description?: string
  description?: string
  price: number
  compare_at_price?: number
  cost_price?: number
  stock_quantity: number
  low_stock_threshold?: number
  packaging_size?: string
  unit?: string
  brand?: string
  status: ProductStatus
  featured?: boolean
  benefits?: string[]
  usage_instructions?: string
  composition?: string
  specifications?: Record<string, string>
}
