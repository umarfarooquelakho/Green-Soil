import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const schema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: user?.profile?.full_name ?? '',
      phone: user?.profile?.phone ?? '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const { error } = await updateProfile({ full_name: data.full_name, phone: data.phone })
    if (error) { toast.error(error) } else { toast.success('Profile updated') }
    setSaving(false)
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-dark-900 mb-6">My Profile</h1>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
          {/* Avatar */}
          <div className="flex items-center gap-4 pb-4 border-b border-dark-100">
            <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.profile?.full_name?.[0]?.toUpperCase() ?? user?.email[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-dark-900">{user?.profile?.full_name ?? 'Customer'}</p>
              <p className="text-sm text-dark-500">{user?.email}</p>
              <p className="text-xs text-primary-600 mt-0.5">{user?.profile?.role}</p>
            </div>
          </div>

          <Input
            label="Full Name"
            required
            error={errors.full_name?.message}
            {...register('full_name')}
          />
          <Input
            label="Email Address"
            type="email"
            value={user?.email ?? ''}
            disabled
            hint="Email cannot be changed"
          />
          <Input
            label="Phone Number"
            type="tel"
            {...register('phone')}
          />

          <Button type="submit" leftIcon={<Save className="w-4 h-4" />} loading={saving}>
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  )
}
