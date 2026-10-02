import { supabase } from '@/lib/supabase'

export interface CEOMessage {
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

export interface Service {
  id: string
  title: string
  slug: string
  short_description: string | null
  description: string | null
  image_url: string | null
  icon: string | null
  features: string[] | null
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Video {
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

export interface SiteSetting {
  key: string
  value: unknown
}

export const contentService = {
  // CEO Message
  async getCEOMessage(): Promise<CEOMessage | null> {
    const { data, error } = await supabase
      .from('ceo_message')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null
    return data
  },

  async updateCEOMessage(id: string, input: Partial<CEOMessage>): Promise<void> {
    const { error } = await supabase
      .from('ceo_message')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  // Services
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('status', 'PUBLISHED')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    if (error) return []
    return data ?? []
  },

  async getAllServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    if (error) return []
    return data ?? []
  },

  async createService(input: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert(input)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async updateService(id: string, input: Partial<Service>): Promise<void> {
    const { error } = await supabase
      .from('services')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  async archiveService(id: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .update({ deleted_at: new Date().toISOString(), status: 'ARCHIVED' })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  // Videos
  async getVideos(): Promise<Video[]> {
    const { data, error } = await supabase
      .from('product_videos')
      .select('*')
      .eq('status', 'PUBLISHED')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    if (error) return []
    return data ?? []
  },

  async getAllVideos(): Promise<Video[]> {
    const { data, error } = await supabase
      .from('product_videos')
      .select('*')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })

    if (error) return []
    return data ?? []
  },

  async createVideo(input: Partial<Video>): Promise<Video> {
    const { data, error } = await supabase
      .from('product_videos')
      .insert(input)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async updateVideo(id: string, input: Partial<Video>): Promise<void> {
    const { error } = await supabase
      .from('product_videos')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  async archiveVideo(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_videos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  // Site settings
  async getSiteSettings(): Promise<Record<string, unknown>> {
    const { data } = await supabase.from('site_settings').select('key, value')
    return Object.fromEntries((data ?? []).map((s) => [s.key, s.value]))
  },

  async updateSiteSetting(key: string, value: unknown, userId: string): Promise<void> {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })

    if (error) throw new Error(error.message)
  },

  // Contact messages
  async submitContactMessage(input: {
    name: string
    email: string
    phone?: string
    subject: string
    message: string
  }): Promise<void> {
    const { error } = await supabase.from('contact_messages').insert({
      ...input,
      status: 'NEW',
    })

    if (error) throw new Error(error.message)
  },

  async getContactMessages(page = 1, pageSize = 20) {
    const { data, error, count } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) throw new Error(error.message)
    return {
      data: data ?? [],
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    }
  },

  async updateMessageStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  // About content
  async getAboutContent(): Promise<Record<string, { title: string | null; body: unknown }>> {
    const { data } = await supabase.from('about_content').select('*')
    return Object.fromEntries(
      (data ?? []).map((item) => [item.section_key, { title: item.title, body: item.body }])
    )
  },

  async updateAboutSection(
    sectionKey: string,
    title: string | null,
    body: unknown,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('about_content')
      .upsert({
        section_key: sectionKey,
        title,
        body,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })

    if (error) throw new Error(error.message)
  },

  // ── Service image upload ──────────────────────────────────────────────────
  async uploadServiceImage(serviceId: string, file: File): Promise<string> {
    const ext      = file.name.split('.').pop()
    const fileName = `services/${serviceId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('service-images')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw new Error(uploadError.message)

    const { data: { publicUrl } } = supabase.storage
      .from('service-images')
      .getPublicUrl(fileName)

    return publicUrl
  },

  // Delete a service image from storage (best-effort)
  async deleteServiceImage(imageUrl: string): Promise<void> {
    // Extract the path after the bucket name
    const match = imageUrl.match(/service-images\/(.+)$/)
    if (!match) return
    await supabase.storage.from('service-images').remove([match[1]])
  },
}
