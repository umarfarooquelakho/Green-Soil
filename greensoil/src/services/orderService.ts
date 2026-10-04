import { supabase } from '@/lib/supabase'
import type { Order, OrderFilters, CheckoutInput } from '@/types/order.types'
import type { PaginatedResult } from '@/types/common.types'
import type { OrderStatus } from '@/types/database.types'

const ORDER_SELECT = `
  id, order_number, customer_id, status, payment_method, payment_status,
  subtotal, shipping_amount, discount_amount, tax_amount, total_amount,
  shipping_address, customer_notes, admin_notes, payment_proof_url,
  created_at, updated_at,
  order_items (
    id, product_id, product_name_snapshot, sku_snapshot,
    unit_price_snapshot, quantity, subtotal, created_at
  )
`

export const orderService = {
  // Customer: get own orders
  async getMyOrders(
    customerId: string,
    page = 1,
    pageSize = 10
  ): Promise<PaginatedResult<Order>> {
    const { data, error, count } = await supabase
      .from('orders')
      .select(ORDER_SELECT, { count: 'exact' })
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) throw new Error(error.message)

    return {
      data: (data ?? []) as Order[],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data as Order
  },

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('order_number', orderNumber)
      .single()

    if (error || !data) return null
    return data as Order
  },

  // Admin: get all orders
  async getAllOrders(
    filters: OrderFilters = {},
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResult<Order>> {
    let query = supabase
      .from('orders')
      .select(`${ORDER_SELECT}, profiles!customer_id(id, full_name, phone)`, { count: 'exact' })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.payment_status) query = query.eq('payment_status', filters.payment_status)
    if (filters.customer_id) query = query.eq('customer_id', filters.customer_id)
    if (filters.date_from) query = query.gte('created_at', filters.date_from)
    if (filters.date_to) query = query.lte('created_at', filters.date_to)
    if (filters.search) {
      query = query.ilike('order_number', `%${filters.search}%`)
    }

    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    const { data, error, count } = await query
    if (error) throw new Error(error.message)

    return {
      data: (data ?? []) as Order[],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    }
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    adminNotes?: string
  ): Promise<void> {
    const updateData: Record<string, string> = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) throw new Error(error.message)
  },

  /**
   * SECURE CHECKOUT — prices are always read from the database
   * This function validates products and calculates totals server-side
   * The browser only sends product_ids + quantities + shipping info
   */
  async createOrder(input: CheckoutInput, customerId: string): Promise<Order> {
    // Step 1: Fetch current product data from DB (never trust browser prices)
    const productIds = input.cart_items.map((i) => i.product_id)
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, sku, price, stock_quantity, status, deleted_at')
      .in('id', productIds)

    if (productError) throw new Error('Failed to validate products')

    // Step 2: Validate each product
    const validatedItems: Array<{
      product_id: string
      product_name_snapshot: string
      sku_snapshot: string
      unit_price_snapshot: number
      quantity: number
      subtotal: number
    }> = []

    for (const cartItem of input.cart_items) {
      const product = products?.find((p) => p.id === cartItem.product_id)

      if (!product) throw new Error(`Product not found: ${cartItem.product_id}`)
      if (product.status !== 'PUBLISHED') throw new Error(`Product is not available: ${product.name}`)
      if (product.deleted_at) throw new Error(`Product is not available: ${product.name}`)
      if (product.stock_quantity < cartItem.quantity) {
        throw new Error(`Insufficient stock for: ${product.name}`)
      }

      validatedItems.push({
        product_id: product.id,
        product_name_snapshot: product.name,
        sku_snapshot: product.sku,
        unit_price_snapshot: product.price, // DB price — not browser price
        quantity: cartItem.quantity,
        subtotal: product.price * cartItem.quantity,
      })
    }

    // Step 3: Fetch shipping/tax config from site_settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['shipping_flat_rate', 'tax_rate'])

    const settingsMap = Object.fromEntries(
      (settings ?? []).map((s: { key: string; value: unknown }) => [s.key, s.value])
    )

    const shippingRate = Number(settingsMap['shipping_flat_rate'] ?? 0)
    const taxRate = Number(settingsMap['tax_rate'] ?? 0) / 100

    // Step 4: Calculate totals
    const subtotal = validatedItems.reduce((sum, item) => sum + item.subtotal, 0)
    const taxAmount = Math.round(subtotal * taxRate)
    const totalAmount = subtotal + shippingRate + taxAmount

    // Step 5: Generate order number
    const year = new Date().getFullYear()
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
    const orderNum = String((count ?? 0) + 1).padStart(6, '0')
    const orderNumber = `GS-${year}-${orderNum}`

    // Step 6: Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        status: 'PENDING',
        payment_method: input.payment_method,
        payment_status: 'PENDING',
        subtotal,
        shipping_amount: shippingRate,
        discount_amount: 0,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        shipping_address: input.shipping_address,
        customer_notes: input.customer_notes ?? null,
      })
      .select('id, order_number')
      .single()

    if (orderError || !order) throw new Error('Failed to create order')

    // Step 7: Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(validatedItems.map((item) => ({ ...item, order_id: order.id })))

    if (itemsError) throw new Error('Failed to create order items')

    // Step 8: Decrement stock (best-effort)
    for (const item of validatedItems) {
      await supabase.rpc('decrement_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      })
    }

    // Step 9: Clear cart
    await supabase.from('cart_items').delete().eq('profile_id', customerId)

    // Return full order
    const fullOrder = await orderService.getOrderById(order.id)
    if (!fullOrder) throw new Error('Order created but could not be retrieved')
    return fullOrder
  },

  // Dashboard stats
  async getOrderStats() {
    const { data } = await supabase
      .from('orders')
      .select('status, total_amount, created_at')

    type OrderRow = { status: string; total_amount: number; created_at: string }
    const rows: OrderRow[] = (data ?? []) as OrderRow[]
    const now = new Date()
    const thisMonth = now.toISOString().slice(0, 7)

    return {
      total: rows.length,
      pending:   rows.filter((o) => o.status === 'PENDING').length,
      delivered: rows.filter((o) => o.status === 'DELIVERED').length,
      cancelled: rows.filter((o) => o.status === 'CANCELLED').length,
      totalRevenue: rows.reduce((sum, o) => sum + (o.total_amount ?? 0), 0),
      thisMonthRevenue: rows
        .filter((o) => o.created_at?.startsWith(thisMonth))
        .reduce((sum, o) => sum + (o.total_amount ?? 0), 0),
    }
  },
}
