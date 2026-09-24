import { useEffect, useState } from 'react'
import { Save, Globe, Phone, Mail, DollarSign, Truck } from 'lucide-react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { contentService } from '@/services/contentService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface SettingsForm {
  company_name: string
  company_phone: string
  company_email: string
  company_address: string
  company_website: string
  currency: string
  tax_rate: string
  shipping_flat_rate: string
  facebook_url: string
  instagram_url: string
  youtube_url: string
  twitter_url: string
}

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const [form, setForm] = useState<SettingsForm>({
    company_name: 'GREEN SOIL Agri Services (PVT) Limited',
    company_phone: '+92 300 000 0000',
    company_email: 'info@greensoilagri.com',
    company_address: 'Pakistan',
    company_website: 'https://greensoilagri.com',
    currency: 'PKR',
    tax_rate: '0',
    shipping_flat_rate: '0',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    twitter_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    contentService.getSiteSettings().then((settings) => {
      setForm((prev) => ({
        ...prev,
        ...(settings as Partial<SettingsForm>),
      }))
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await Promise.all(
        Object.entries(form).map(([key, value]) =>
          contentService.updateSiteSetting(key, value, user.id)
        )
      )
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const update = (key: keyof SettingsForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  if (loading) return <div className="p-8 text-center text-dark-400">Loading settings...</div>

  const Section = ({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>, title: string, children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-dark-100 p-6">
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-dark-100">
        <Icon className="w-5 h-5 text-primary-600" />
        <h2 className="font-bold text-dark-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900">Settings</h1>
        <Button leftIcon={<Save className="w-4 h-4" />} onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>

      <Section icon={Globe} title="Company Information">
        <Input label="Company Name" value={form.company_name} onChange={update('company_name')} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Phone" value={form.company_phone} onChange={update('company_phone')} leftIcon={<Phone className="w-4 h-4" />} />
          <Input label="Email" type="email" value={form.company_email} onChange={update('company_email')} leftIcon={<Mail className="w-4 h-4" />} />
        </div>
        <Textarea label="Address" value={form.company_address} onChange={update('company_address')} rows={2} />
        <Input label="Website" value={form.company_website} onChange={update('company_website')} />
      </Section>

      <Section icon={DollarSign} title="Pricing & Tax">
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Currency Code" value={form.currency} onChange={update('currency')} hint="e.g. PKR, USD" />
          <Input label="Tax Rate (%)" type="number" value={form.tax_rate} onChange={update('tax_rate')} hint="0 for no tax" />
          <Input label="Flat Shipping Rate (PKR)" type="number" value={form.shipping_flat_rate} onChange={update('shipping_flat_rate')} leftIcon={<Truck className="w-4 h-4" />} />
        </div>
      </Section>

      <Section icon={Globe} title="Social Media Links">
        <Input label="Facebook" value={form.facebook_url} onChange={update('facebook_url')} placeholder="https://facebook.com/..." />
        <Input label="Instagram" value={form.instagram_url} onChange={update('instagram_url')} placeholder="https://instagram.com/..." />
        <Input label="YouTube" value={form.youtube_url} onChange={update('youtube_url')} placeholder="https://youtube.com/..." />
        <Input label="Twitter / X" value={form.twitter_url} onChange={update('twitter_url')} placeholder="https://twitter.com/..." />
      </Section>
    </div>
  )
}
