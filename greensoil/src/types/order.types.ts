import type { OrderStatus, PaymentMethod, PaymentStatus } from './database.types'

export interface Order {
  id: string
  order_number: string
  customer_id: string
  customer?: {
    id: string
    full_name: string | null
    email: string
    phone: string | null
  }
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  subtotal: number
  shipping_amount: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  shipping_address: ShippingAddress
  customer_notes: string | null
  admin_notes: string | null
  payment_proof_url: string | null
  items?: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name_snapshot: string
  sku_snapshot: string
  unit_price_snapshot: number
  quantity: number
  subtotal: number
  created_at: string
}

export interface ShippingAddress {
  full_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  province?: string
  country: string
  postal_code?: string
}

export interface CartItem {
  id: string
  profile_id: string
  product_id: string
  quantity: number
  product?: {
    id: string
    name: string
    slug: string
    sku: string
    price: number
    compare_at_price: number | null
    stock_quantity: number
    status: string
    images?: { url: string; is_primary: boolean }[]
  }
  created_at: string
  updated_at: string
}

export interface LocalCartItem {
  product_id: string
  quantity: number
  product?: CartItem['product']
}

export interface CheckoutInput {
  shipping_address: ShippingAddress
  payment_method: PaymentMethod
  customer_notes?: string
  cart_items: { product_id: string; quantity: number }[]
}

export interface OrderFilters {
  search?: string
  status?: OrderStatus
  payment_status?: PaymentStatus
  date_from?: string
  date_to?: string
  customer_id?: string
}
