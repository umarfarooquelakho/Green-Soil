import { Bell } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-900">Notifications</h1>
      <EmptyState icon={<Bell className="w-8 h-8" />} title="No notifications" description="System notifications will appear here." />
    </div>
  )
}
