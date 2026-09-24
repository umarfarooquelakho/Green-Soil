// Auto-generated types matching Supabase database schema
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'SUPER_ADMIN' | 'DIRECTOR' | 'CEO' | 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER'

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'

export type PaymentMethod = 'COD' | 'BANK_TRANSFER'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'RESIGNED'

export type ContactMessageStatus = 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED'

export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role_id?: string | null
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: UserRole
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: UserRole
          description?: string | null
          created_at?: string
        }
        Update: {
          name?: UserRole
          description?: string | null
        }
      }
      permissions: {
        Row: {
          id: string
          code: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          created_at?: string
        }
        Update: {
          code?: string
          description?: string | null
        }
      }
      role_permissions: {
        Row: {
          role_id: string
          permission_id: string
        }
        Insert: {
          role_id: string
          permission_id: string
        }
        Update: {
          role_id?: string
          permission_id?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
        }
      }
      employees: {
        Row: {
          id: string
          profile_id: string
          employee_code: string
          department_id: string | null
          designation: string | null
          joining_date: string | null
          employment_status: EmploymentStatus
          address: string | null
          emergency_contact: Json | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          employee_code: string
          department_id?: string | null
          designation?: string | null
          joining_date?: string | null
          employment_status?: EmploymentStatus
          address?: string | null
          emergency_contact?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          department_id?: string | null
          designation?: string | null
          joining_date?: string | null
          employment_status?: EmploymentStatus
          address?: string | null
          emergency_contact?: Json | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      customers: {
        Row: {
          id: string
          profile_id: string
          customer_code: string
          preferred_city: string | null
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          customer_code: string
          preferred_city?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          preferred_city?: string | null
          notes?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      addresses: {
        Row: {
          id: string
          profile_id: string
          label: string
          full_name: string
          phone: string | null
          address_line1: string
          address_line2: string | null
          city: string
          province: string | null
          country: string
          postal_code: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          label?: string
          full_name: string
          phone?: string | null
          address_line1: string
          address_line2?: string | null
          city: string
          province?: string | null
          country?: string
          postal_code?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          label?: string
          full_name?: string
          phone?: string | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          province?: string | null
          country?: string
          postal_code?: string | null
          is_default?: boolean
          updated_at?: string
        }
      }
      product_categories: {
        Row: {
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
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          icon?: string | null
          parent_id?: string | null
          sort_order?: number
          status?: 'ACTIVE' | 'INACTIVE'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          icon?: string | null
          parent_id?: string | null
          sort_order?: number
          status?: 'ACTIVE' | 'INACTIVE'
          updated_at?: string
          deleted_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          sku: string
          category_id: string | null
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
          benefits: Json | null
          usage_instructions: string | null
          composition: string | null
          specifications: Json | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sku: string
          category_id?: string | null
          short_description?: string | null
          description?: string | null
          price: number
          compare_at_price?: number | null
          cost_price?: number | null
          stock_quantity?: number
          reserved_quantity?: number
          low_stock_threshold?: number
          packaging_size?: string | null
          unit?: string | null
          brand?: string | null
          status?: ProductStatus
          featured?: boolean
          benefits?: Json | null
          usage_instructions?: string | null
          composition?: string | null
          specifications?: Json | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          name?: string
          slug?: string
          sku?: string
          category_id?: string | null
          short_description?: string | null
          description?: string | null
          price?: number
          compare_at_price?: number | null
          cost_price?: number | null
          stock_quantity?: number
          reserved_quantity?: number
          low_stock_threshold?: number
          packaging_size?: string | null
          unit?: string | null
          brand?: string | null
          status?: ProductStatus
          featured?: boolean
          benefits?: Json | null
          usage_instructions?: string | null
          composition?: string | null
          specifications?: Json | null
          updated_at?: string
          deleted_at?: string | null
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          url?: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
        }
      }
      product_videos: {
        Row: {
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
        Insert: {
          id?: string
          product_id?: string | null
          title: string
          description?: string | null
          youtube_url: string
          thumbnail_url?: string | null
          category?: string | null
          status?: 'PUBLISHED' | 'DRAFT'
          sort_order?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          product_id?: string | null
          title?: string
          description?: string | null
          youtube_url?: string
          thumbnail_url?: string | null
          category?: string | null
          status?: 'PUBLISHED' | 'DRAFT'
          sort_order?: number
          updated_at?: string
          deleted_at?: string | null
        }
      }
      services: {
        Row: {
          id: string
          title: string
          slug: string
          short_description: string | null
          description: string | null
          image_url: string | null
          icon: string | null
          features: Json | null
          status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
          sort_order: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          short_description?: string | null
          description?: string | null
          image_url?: string | null
          icon?: string | null
          features?: Json | null
          status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
          sort_order?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          title?: string
          slug?: string
          short_description?: string | null
          description?: string | null
          image_url?: string | null
          icon?: string | null
          features?: Json | null
          status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
          sort_order?: number
          updated_at?: string
          deleted_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          status: OrderStatus
          payment_method: PaymentMethod
          payment_status: PaymentStatus
          subtotal: number
          shipping_amount: number
          discount_amount: number
          tax_amount: number
          total_amount: number
          shipping_address: Json
          customer_notes: string | null
          admin_notes: string | null
          payment_proof_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_id: string
          status?: OrderStatus
          payment_method: PaymentMethod
          payment_status?: PaymentStatus
          subtotal: number
          shipping_amount?: number
          discount_amount?: number
          tax_amount?: number
          total_amount: number
          shipping_address: Json
          customer_notes?: string | null
          admin_notes?: string | null
          payment_proof_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: OrderStatus
          payment_method?: PaymentMethod
          payment_status?: PaymentStatus
          shipping_amount?: number
          discount_amount?: number
          tax_amount?: number
          total_amount?: number
          shipping_address?: Json
          customer_notes?: string | null
          admin_notes?: string | null
          payment_proof_url?: string | null
          updated_at?: string
        }
      }
      order_items: {
        Row: {
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
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name_snapshot: string
          sku_snapshot: string
          unit_price_snapshot: number
          quantity: number
          subtotal: number
          created_at?: string
        }
        Update: {
          quantity?: number
          subtotal?: number
        }
      }
      cart_items: {
        Row: {
          id: string
          profile_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          product_id: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          quantity?: number
          updated_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          profile_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          product_id: string
          created_at?: string
        }
        Update: Record<string, never>
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subject: string
          message: string
          status: ContactMessageStatus
          admin_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          subject: string
          message: string
          status?: ContactMessageStatus
          admin_notes?: string | null
          created_at?: string
        }
        Update: {
          status?: ContactMessageStatus
          admin_notes?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          profile_id: string
          title: string
          body: string
          type: string
          entity_type: string | null
          entity_id: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          title: string
          body: string
          type: string
          entity_type?: string | null
          entity_id?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          read_at?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: Record<string, never>
      }
      ceo_message: {
        Row: {
          id: string
          ceo_name: string
          designation: string
          photo_url: string | null
          signature_url: string | null
          message: string
          vision: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          ceo_name: string
          designation: string
          photo_url?: string | null
          signature_url?: string | null
          message: string
          vision?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ceo_name?: string
          designation?: string
          photo_url?: string | null
          signature_url?: string | null
          message?: string
          vision?: string | null
          updated_at?: string
          updated_by?: string | null
        }
      }
      about_content: {
        Row: {
          id: string
          section_key: string
          title: string | null
          body: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          section_key: string
          title?: string | null
          body?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          title?: string | null
          body?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
      }
      homepage_sections: {
        Row: {
          id: string
          section_key: string
          title: string | null
          subtitle: string | null
          content: Json | null
          status: 'ACTIVE' | 'INACTIVE'
          sort_order: number
          updated_at: string
        }
        Insert: {
          id?: string
          section_key: string
          title?: string | null
          subtitle?: string | null
          content?: Json | null
          status?: 'ACTIVE' | 'INACTIVE'
          sort_order?: number
          updated_at?: string
        }
        Update: {
          title?: string | null
          subtitle?: string | null
          content?: Json | null
          status?: 'ACTIVE' | 'INACTIVE'
          sort_order?: number
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          key: string
          value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          value?: Json
          updated_at?: string
          updated_by?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      product_status: ProductStatus
      order_status: OrderStatus
      payment_method: PaymentMethod
      payment_status: PaymentStatus
      employment_status: EmploymentStatus
    }
  }
}
