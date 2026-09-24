import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit, Archive, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { contentService } from '@/services/contentService'
import type { Video } from '@/services/contentService'
import { getYouTubeThumbnail } from '@/lib/utils'
import toast from 'react-hot-toast'

const emptyForm = {
  title: '', description: '', youtube_url: '', category: '', status: 'PUBLISHED' as const,
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Video | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<Video | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await contentService.getAllVideos()
    setVideos(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditTarget(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (v: Video) => {
    setEditTarget(v)
    setForm({ title: v.title, description: v.description ?? '', youtube_url: v.youtube_url, category: v.category ?? '', status: v.status })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.youtube_url) { toast.error('Title and YouTube URL are required'); return }
    setSaving(true)
    try {
      const thumb = getYouTubeThumbnail(form.youtube_url)
      if (editTarget) {
        await contentService.updateVideo(editTarget.id, { ...form, thumbnail_url: thumb })
        toast.success('Video updated')
      } else {
        await contentService.createVideo({ ...form, thumbnail_url: thumb, sort_order: videos.length })
        toast.success('Video added')
      }
      setModalOpen(false)
      load()
    } catch { toast.error('Failed to save video') }
    finally { setSaving(false) }
  }

  const handleArchive = async () => {
    if (!archiveTarget) return
    await contentService.archiveVideo(archiveTarget.id)
    toast.success('Video archived')
    setArchiveTarget(null)
    load()
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Product Videos</h1>
          <p className="text-dark-500 text-sm mt-0.5">{videos.length} videos</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>Add Video</Button>
      </div>

      {videos.length === 0 ? (
        <EmptyState icon={<Play className="w-8 h-8" />} title="No videos yet" action={{ label: 'Add First Video', onClick: openNew }} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => {
            const thumb = video.thumbnail_url || getYouTubeThumbnail(video.youtube_url)
            return (
              <div key={video.id} className="bg-white rounded-xl border border-dark-100 overflow-hidden">
                <div className="relative aspect-video bg-dark-900">
                  {thumb && <img src={thumb} alt={video.title} className="w-full h-full object-cover opacity-80" />}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-10 h-10 text-white/80" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant={video.status === 'PUBLISHED' ? 'success' : 'warning'} size="sm">
                      {video.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-dark-900 line-clamp-1">{video.title}</p>
                  {video.category && <p className="text-xs text-primary-600 mt-0.5">{video.category}</p>}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(video)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-dark-600 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => setArchiveTarget(video)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <Archive className="w-3.5 h-3.5" /> Archive
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Video' : 'Add Video'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </div>
        }>
        <div className="space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input label="YouTube URL" required value={form.youtube_url} onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))} placeholder="https://youtu.be/..." />
          <Input label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Product Demo, Tutorial" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
          <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'PUBLISHED' | 'DRAFT' }))}
            options={[{ value: 'PUBLISHED', label: 'Published' }, { value: 'DRAFT', label: 'Draft' }]} />
        </div>
      </Modal>

      <ConfirmDialog open={!!archiveTarget} onClose={() => setArchiveTarget(null)} onConfirm={handleArchive}
        title="Archive Video" message={`Archive "${archiveTarget?.title}"?`} confirmLabel="Archive" />
    </div>
  )
}
