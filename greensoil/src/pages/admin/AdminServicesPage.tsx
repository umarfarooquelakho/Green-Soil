import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit, Archive, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { contentService } from '@/services/contentService'
import type { Service } from '@/services/contentService'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'

const emptyForm = { title: '', slug: '', short_description: '', description: '', status: 'PUBLISHED' as const, sort_order: 0 }

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Service | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await contentService.getAllServices()
    setServices(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditTarget(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (s: Service) => {
    setEditTarget(s)
    setForm({ title: s.title, slug: s.slug, short_description: s.short_description ?? '', description: s.description ?? '', status: s.status as typeof emptyForm.status, sort_order: s.sort_order })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.title) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const data = { ...form, slug: form.slug || slugify(form.title) }
      if (editTarget) {
        await contentService.updateService(editTarget.id, data)
        toast.success('Service updated')
      } else {
        await contentService.createService(data)
        toast.success('Service created')
      }
      setModalOpen(false)
      load()
    } catch { toast.error('Failed to save service') }
    finally { setSaving(false) }
  }

  const handleArchive = async () => {
    if (!archiveTarget) return
    await contentService.archiveService(archiveTarget.id)
    toast.success('Service archived')
    setArchiveTarget(null)
    load()
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Services</h1>
          <p className="text-dark-500 text-sm">{services.length} services</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>Add Service</Button>
      </div>

      {services.length === 0 ? (
        <EmptyState icon={<Wrench className="w-8 h-8" />} title="No services yet" action={{ label: 'Add First Service', onClick: openNew }} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => (
            <div key={svc.id} className="bg-white rounded-xl border border-dark-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-dark-900">{svc.title}</h3>
                <Badge variant={svc.status === 'PUBLISHED' ? 'success' : svc.status === 'DRAFT' ? 'warning' : 'default'} size="sm">
                  {svc.status}
                </Badge>
              </div>
              <p className="text-sm text-dark-500 line-clamp-2 mb-4">{svc.short_description}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(svc)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-dark-600 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setArchiveTarget(svc)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <Archive className="w-3.5 h-3.5" /> Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Service' : 'New Service'} size="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save Service</Button>
          </div>
        }>
        <div className="space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value, slug: slugify(e.target.value) })) }} />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} hint="URL-friendly identifier" />
          <Textarea label="Short Description" value={form.short_description} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))} rows={2} />
          <Textarea label="Full Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof form.status }))}
              options={[{ value: 'PUBLISHED', label: 'Published' }, { value: 'DRAFT', label: 'Draft' }]} />
            <Input label="Sort Order" type="number" value={String(form.sort_order)} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!archiveTarget} onClose={() => setArchiveTarget(null)} onConfirm={handleArchive}
        title="Archive Service" message={`Archive "${archiveTarget?.title}"?`} confirmLabel="Archive" />
    </div>
  )
}
