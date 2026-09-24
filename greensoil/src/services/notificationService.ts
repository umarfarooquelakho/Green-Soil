import { supabase } from '@/lib/supabase'

export const notificationService = {
  async getMyNotifications(limit = 20) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    return data ?? []
  },

  async getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', user.id)
      .is('read_at', null)

    return count ?? 0
  },

  async markRead(id: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
  },

  async markAllRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('profile_id', user.id)
      .is('read_at', null)
  },

  async createNotification(profileId: string, title: string, body: string, type: string, entityType?: string, entityId?: string) {
    await supabase.from('notifications').insert({
      profile_id: profileId,
      title,
      body,
      type,
      entity_type: entityType,
      entity_id: entityId,
    })
  },
}
