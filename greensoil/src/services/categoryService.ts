import { supabase } from '@/lib/supabase'
import type { ProductCategory } from '@/types/product.types'

export const categoryService = {
  async getCategories(): Promise<ProductCategory[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('status', 'ACTIVE')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    if (error) return []
    return data ?? []
  },

  async getAllCategories(): Promise<ProductCategory[]> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    if (error) return []
    return data ?? []
  },

  async createCategory(input: Partial<ProductCategory>): Promise<ProductCategory> {
    const { data, error } = await supabase
      .from('product_categories')
      .insert(input)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async updateCategory(id: string, input: Partial<ProductCategory>): Promise<ProductCategory> {
    const { data, error } = await supabase
      .from('product_categories')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_categories')
      .update({ deleted_at: new Date().toISOString(), status: 'INACTIVE' })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },
}
