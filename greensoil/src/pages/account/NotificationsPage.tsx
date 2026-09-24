import { Bell } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-dark-900 mb-6">Notifications</h1>
      <EmptyState
        icon={<Bell className="w-8 h-8" />}
        title="No notifications"
        description="You'll see order updates and system notifications here."
      />
    </div>
  )
}
