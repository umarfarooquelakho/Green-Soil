import { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { CartItem, LocalCartItem } from '@/types/order.types'
import { useAuth } from './AuthContext'

const LOCAL_CART_KEY = 'greensoil_cart'

interface CartState {
  items: CartItem[]
  loading: boolean
  itemCount: number
}

type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR' }

interface CartContextValue {
  items: CartItem[]
  loading: boolean
  itemCount: number
  subtotal: number
  addItem: (productId: string, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  hasItem: (productId: string) => boolean
  getItemQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextValue | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS': {
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      return { ...state, items: action.payload, itemCount }
    }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'CLEAR':
      return { ...state, items: [], itemCount: 0 }
    default:
      return state
  }
}

// Local storage helpers for guest users
function getLocalCart(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function setLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items))
}

function clearLocalCart() {
  localStorage.removeItem(LOCAL_CART_KEY)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loading: false,
    itemCount: 0,
  })

  // Fetch cart from DB for logged-in users
  const fetchCart = useCallback(async () => {
    if (!user) {
      // Load from localStorage for guests
      const localItems = getLocalCart()
      if (localItems.length > 0) {
        // Fetch product info for local items
        const productIds = localItems.map((i) => i.product_id)
        const { data: products } = await supabase
          .from('products')
          .select('id, name, slug, sku, price, compare_at_price, stock_quantity, status, product_images(url, is_primary)')
          .in('id', productIds)
          .eq('status', 'PUBLISHED')

        const cartItems: CartItem[] = localItems.map((localItem) => {
          const product = products?.find((p) => p.id === localItem.product_id)
          const images = product?.product_images as { url: string; is_primary: boolean }[] | undefined
          return {
            id: localItem.product_id,
            profile_id: '',
            product_id: localItem.product_id,
            quantity: localItem.quantity,
            product: product
              ? {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  sku: product.sku,
                  price: product.price,
                  compare_at_price: product.compare_at_price,
                  stock_quantity: product.stock_quantity,
                  status: product.status,
                  images,
                }
              : undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        })
        dispatch({ type: 'SET_ITEMS', payload: cartItems })
      } else {
        dispatch({ type: 'SET_ITEMS', payload: [] })
      }
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        profile_id,
        product_id,
        quantity,
        created_at,
        updated_at,
        products (
          id, name, slug, sku, price, compare_at_price, stock_quantity, status,
          product_images (url, is_primary)
        )
      `)
      .eq('profile_id', user.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      const items = data.map((item) => {
        const product = item.products as CartItem['product'] & { product_images?: { url: string; is_primary: boolean }[] } | null
        return {
          id: item.id,
          profile_id: item.profile_id,
          product_id: item.product_id,
          quantity: item.quantity,
          product: product
            ? {
                id: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                price: product.price,
                compare_at_price: product.compare_at_price,
                stock_quantity: product.stock_quantity,
                status: product.status,
                images: product.product_images,
              }
            : undefined,
          created_at: item.created_at,
          updated_at: item.updated_at,
        }
      })
      dispatch({ type: 'SET_ITEMS', payload: items })
    }
    dispatch({ type: 'SET_LOADING', payload: false })
  }, [user])

  // Merge local cart into DB cart when user logs in
  const mergeLocalCart = useCallback(async () => {
    if (!user) return
    const localItems = getLocalCart()
    if (localItems.length === 0) return

    for (const localItem of localItems) {
      // Check if item already in DB cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('profile_id', user.id)
        .eq('product_id', localItem.product_id)
        .single()

      if (existing) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({
            quantity: existing.quantity + localItem.quantity,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
      } else {
        // Insert new item
        await supabase.from('cart_items').insert({
          profile_id: user.id,
          product_id: localItem.product_id,
          quantity: localItem.quantity,
        })
      }
    }

    clearLocalCart()
    await fetchCart()
  }, [user, fetchCart])

  useEffect(() => {
    if (user) {
      mergeLocalCart()
    } else {
      fetchCart()
    }
  }, [user, fetchCart, mergeLocalCart])

  const addItem = async (productId: string, quantity = 1) => {
    if (!user) {
      // Guest: use localStorage
      const localCart = getLocalCart()
      const existing = localCart.find((i) => i.product_id === productId)
      if (existing) {
        existing.quantity += quantity
      } else {
        localCart.push({ product_id: productId, quantity })
      }
      setLocalCart(localCart)
      await fetchCart()
      return
    }

    // Check if already in cart
    const existing = state.items.find((i) => i.product_id === productId)
    if (existing) {
      await supabase
        .from('cart_items')
        .update({
          quantity: existing.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('cart_items').insert({
        profile_id: user.id,
        product_id: productId,
        quantity,
      })
    }
    await fetchCart()
  }

  const removeItem = async (productId: string) => {
    if (!user) {
      const localCart = getLocalCart().filter((i) => i.product_id !== productId)
      setLocalCart(localCart)
      await fetchCart()
      return
    }

    await supabase
      .from('cart_items')
      .delete()
      .eq('profile_id', user.id)
      .eq('product_id', productId)

    dispatch({
      type: 'SET_ITEMS',
      payload: state.items.filter((i) => i.product_id !== productId),
    })
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId)
      return
    }

    if (!user) {
      const localCart = getLocalCart().map((i) =>
        i.product_id === productId ? { ...i, quantity } : i
      )
      setLocalCart(localCart)
      await fetchCart()
      return
    }

    const item = state.items.find((i) => i.product_id === productId)
    if (!item) return

    await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', item.id)

    dispatch({
      type: 'SET_ITEMS',
      payload: state.items.map((i) =>
        i.product_id === productId ? { ...i, quantity } : i
      ),
    })
  }

  const clearCart = async () => {
    if (!user) {
      clearLocalCart()
      dispatch({ type: 'CLEAR' })
      return
    }

    await supabase.from('cart_items').delete().eq('profile_id', user.id)
    dispatch({ type: 'CLEAR' })
  }

  const hasItem = (productId: string) =>
    state.items.some((i) => i.product_id === productId)

  const getItemQuantity = (productId: string) => {
    const item = state.items.find((i) => i.product_id === productId)
    return item?.quantity ?? 0
  }

  const subtotal = state.items.reduce((sum, item) => {
    const price = item.product?.price ?? 0
    return sum + price * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        loading: state.loading,
        itemCount: state.itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        hasItem,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
