import { useEffect, useState } from 'react'
import { Save, Upload } from 'lucide-react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { contentService } from '@/services/contentService'
import type { CEOMessage } from '@/services/contentService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AdminContentPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'ceo' | 'about'>('ceo')
  const [ceo, setCeo] = useState<CEOMessage | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contentService.getCEOMessage().then((data) => {
      setCeo(data)
      setLoading(false)
    })
  }, [])

  const saveCEO = async () => {
    if (!ceo || !user) return
    setSaving(true)
    try {
      await contentService.updateCEOMessage(ceo.id, {
        ceo_name: ceo.ceo_name,
        designation: ceo.designation,
        message: ceo.message,
        vision: ceo.vision,
      })
      toast.success('CEO message updated')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { key: 'ceo', label: 'CEO Message' },
    { key: 'about', label: 'About Us' },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-dark-900">Content Management</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-dark-100">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-dark-500 hover:text-dark-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ceo' && (
        <div className="bg-white rounded-xl border border-dark-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-dark-900">CEO Message</h2>
            <Button size="sm" leftIcon={<Save className="w-4 h-4" />} onClick={saveCEO} loading={saving} disabled={!ceo}>
              Save
            </Button>
          </div>

          {loading ? (
            <p className="text-dark-400 text-sm">Loading...</p>
          ) : !ceo ? (
            <p className="text-dark-400 text-sm">No CEO message found. Please create one in the database.</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="CEO Name"
                  value={ceo.ceo_name}
                  onChange={(e) => setCeo({ ...ceo, ceo_name: e.target.value })}
                />
                <Input
                  label="Designation"
                  value={ceo.designation}
                  onChange={(e) => setCeo({ ...ceo, designation: e.target.value })}
                />
              </div>

              <div className="flex items-start gap-4 p-4 bg-dark-50 rounded-xl border border-dark-100">
                {ceo.photo_url ? (
                  <img src={ceo.photo_url} alt="CEO" className="w-20 h-20 rounded-xl object-cover border border-dark-200" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-dark-200 flex items-center justify-center text-dark-400 text-2xl font-bold">
                    {ceo.ceo_name[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-dark-700 mb-2">CEO Photo</p>
                  <Button size="sm" variant="outline" leftIcon={<Upload className="w-3.5 h-3.5" />}>
                    Upload Photo
                  </Button>
                  <p className="text-xs text-dark-400 mt-1">JPG, PNG or WebP · Max 5MB</p>
                </div>
              </div>

              <Textarea
                label="CEO Message"
                value={ceo.message}
                onChange={(e) => setCeo({ ...ceo, message: e.target.value })}
                rows={8}
                hint="Markdown not supported. Plain text only."
              />

              <Textarea
                label="Company Vision"
                value={ceo.vision ?? ''}
                onChange={(e) => setCeo({ ...ceo, vision: e.target.value })}
                rows={3}
              />
            </>
          )}
        </div>
      )}

      {tab === 'about' && (
        <div className="bg-white rounded-xl border border-dark-100 p-6">
          <h2 className="font-bold text-dark-900 mb-4">About Us Content</h2>
          <p className="text-dark-500 text-sm">
            About Us content editing will be available in the next update. The page currently displays static content that can be updated here.
          </p>
        </div>
      )}
    </div>
  )
}
