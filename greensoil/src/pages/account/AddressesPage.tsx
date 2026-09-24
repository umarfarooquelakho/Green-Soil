import { MapPin } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function AddressesPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-dark-900 mb-6">My Addresses</h1>
      <EmptyState
        icon={<MapPin className="w-8 h-8" />}
        title="No addresses saved"
        description="Add a delivery address to speed up checkout."
        action={{ label: 'Add Address', onClick: () => {} }}
      />
    </div>
  )
}
