import { useEffect, useState, useCallback } from 'react'
import { Plus, Edit, Trash2, Layers } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { categoryService } from '@/services/categoryService'
import type { ProductCategory } from '@/types/product.types'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ProductCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', status: 'ACTIVE' as const })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await categoryService.getAllCategories()
    setCategories(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => { setEditTarget(null); setForm({ name: '', slug: '', description: '', status: 'ACTIVE' }); setModalOpen(true) }
  const openEdit = (c: ProductCategory) => {
    setEditTarget(c)
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', status: c.status })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const data = { ...form, slug: form.slug || slugify(form.name) }
      if (editTarget) {
        await categoryService.updateCategory(editTarget.id, data)
        toast.success('Category updated')
      } else {
        await categoryService.createCategory(data)
        toast.success('Category created')
      }
      setModalOpen(false)
      load()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await categoryService.deleteCategory(deleteTarget.id)
    toast.success('Category removed')
    setDeleteTarget(null)
    load()
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900">Categories</h1>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>Add Category</Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={<Layers className="w-8 h-8" />} title="No categories" action={{ label: 'Add Category', onClick: openNew }} />
      ) : (
        <div className="bg-white rounded-xl border border-dark-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-dark-50 border-b border-dark-100">
                {['Name', 'Slug', 'Status', 'Order', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-dark-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-dark-50/50">
                  <td className="px-4 py-3 font-medium text-dark-900">{cat.name}</td>
                  <td className="px-4 py-3 text-dark-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <Badge variant={cat.status === 'ACTIVE' ? 'success' : 'default'} size="sm">{cat.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-dark-500">{cat.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(cat)} className="p-1.5 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(cat)} className="p-1.5 text-dark-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Category' : 'New Category'}
        footer={<div className="flex gap-3 justify-end"><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></div>}>
        <div className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Remove Category" message={`Remove category "${deleteTarget?.name}"?`} confirmLabel="Remove" />
    </div>
  )
}
