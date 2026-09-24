import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Save, Plus, Trash2, Upload, X, GripVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import type { Product, ProductCategory } from '@/types/product.types'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductForm {
  name: string
  slug: string
  sku: string
  category_id: string
  short_description: string
  description: string
  price: string
  compare_at_price: string
  cost_price: string
  stock_quantity: string
  low_stock_threshold: string
  packaging_size: string
  unit: string
  brand: string
  composition: string
  usage_instructions: string
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
  featured: boolean
  benefits: string[]
  specifications: Array<{ key: string; value: string }>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const emptyForm = (): ProductForm => ({
  name: '',
  slug: '',
  sku: '',
  category_id: '',
  short_description: '',
  description: '',
  price: '',
  compare_at_price: '',
  cost_price: '',
  stock_quantity: '0',
  low_stock_threshold: '10',
  packaging_size: '',
  unit: '',
  brand: '',
  composition: '',
  usage_instructions: '',
  status: 'DRAFT',
  featured: false,
  benefits: [],
  specifications: [],
})

function productToForm(p: Product): ProductForm {
  return {
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category_id: p.category_id ?? '',
    short_description: p.short_description ?? '',
    description: p.description ?? '',
    price: String(p.price),
    compare_at_price: p.compare_at_price ? String(p.compare_at_price) : '',
    cost_price: p.cost_price ? String(p.cost_price) : '',
    stock_quantity: String(p.stock_quantity),
    low_stock_threshold: String(p.low_stock_threshold),
    packaging_size: p.packaging_size ?? '',
    unit: p.unit ?? '',
    brand: p.brand ?? '',
    composition: p.composition ?? '',
    usage_instructions: p.usage_instructions ?? '',
    status: p.status as ProductForm['status'],
    featured: p.featured,
    benefits: p.benefits ?? [],
    specifications: p.specifications
      ? Object.entries(p.specifications).map(([key, value]) => ({ key, value }))
      : [],
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
interface SectionProps { title: string; children: React.ReactNode }
function Section({ title, children }: SectionProps) {
  return (
    <div className="bg-white rounded-xl border border-dark-100 p-6">
      <h2 className="text-base font-bold text-dark-900 mb-5 pb-4 border-b border-dark-100">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState<ProductForm>(emptyForm())
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  // Image state (for existing product)
  const [existingImages, setExistingImages] = useState<Product['images']>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [imageUploading, setImageUploading] = useState(false)

  // New benefit / spec input state
  const [newBenefit, setNewBenefit] = useState('')
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecVal, setNewSpecVal] = useState('')

  // Load categories and (if edit) product
  useEffect(() => {
    categoryService.getAllCategories().then(setCategories)
  }, [])

  useEffect(() => {
    if (!isEdit || !id) return
    productService.getProductById(id).then((p) => {
      if (!p) { toast.error('Product not found'); navigate('/admin/products'); return }
      setForm(productToForm(p))
      setExistingImages(p.images ?? [])
      setLoading(false)
    })
  }, [id, isEdit, navigate])

  // ─── Field helpers ──────────────────────────────────────────────────────────
  const set = useCallback(
    (key: keyof ProductForm) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }))
      },
    []
  )

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setForm((f) => ({ ...f, name, slug: !isEdit ? slugify(name) : f.slug }))
  }

  // ─── Benefits ──────────────────────────────────────────────────────────────
  const addBenefit = () => {
    const val = newBenefit.trim()
    if (!val) return
    setForm((f) => ({ ...f, benefits: [...f.benefits, val] }))
    setNewBenefit('')
  }

  const removeBenefit = (idx: number) =>
    setForm((f) => ({ ...f, benefits: f.benefits.filter((_, i) => i !== idx) }))

  // ─── Specifications ─────────────────────────────────────────────────────────
  const addSpec = () => {
    if (!newSpecKey.trim()) return
    setForm((f) => ({ ...f, specifications: [...f.specifications, { key: newSpecKey.trim(), value: newSpecVal.trim() }] }))
    setNewSpecKey('')
    setNewSpecVal('')
  }

  const removeSpec = (idx: number) =>
    setForm((f) => ({ ...f, specifications: f.specifications.filter((_, i) => i !== idx) }))

  const updateSpec = (idx: number, field: 'key' | 'value', val: string) =>
    setForm((f) => {
      const specs = [...f.specifications]
      specs[idx] = { ...specs[idx], [field]: val }
      return { ...f, specifications: specs }
    })

  // ─── Image upload ───────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const valid = files.filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
    if (valid.length < files.length) toast.error('Some files were skipped (not image or > 5MB)')
    setPendingFiles((prev) => [...prev, ...valid])
    e.target.value = ''
  }

  const removePending = (idx: number) =>
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx))

  const removeExistingImage = async (imgId: string) => {
    // Soft-delete from product_images
    const { supabase } = await import('@/lib/supabase')
    await supabase.from('product_images').delete().eq('id', imgId)
    setExistingImages((prev) => prev?.filter((i) => i.id !== imgId))
    toast.success('Image removed')
  }

  // ─── Validation ─────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!form.name.trim()) return 'Product name is required'
    if (!form.sku.trim()) return 'SKU is required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) return 'Valid price is required'
    if (form.stock_quantity === '' || isNaN(Number(form.stock_quantity))) return 'Stock quantity is required'
    return null
  }

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) { toast.error(err); return }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug || slugify(form.name),
        sku: form.sku.trim(),
        category_id: form.category_id || undefined,
        short_description: form.short_description.trim() || undefined,
        description: form.description.trim() || undefined,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : undefined,
        cost_price: form.cost_price ? Number(form.cost_price) : undefined,
        stock_quantity: Number(form.stock_quantity),
        low_stock_threshold: Number(form.low_stock_threshold) || 10,
        packaging_size: form.packaging_size.trim() || undefined,
        unit: form.unit.trim() || undefined,
        brand: form.brand.trim() || undefined,
        composition: form.composition.trim() || undefined,
        usage_instructions: form.usage_instructions.trim() || undefined,
        status: form.status,
        featured: form.featured,
        benefits: form.benefits.length ? form.benefits : undefined,
        specifications: form.specifications.length
          ? Object.fromEntries(form.specifications.map(({ key, value }) => [key, value]))
          : undefined,
      }

      let productId: string

      if (isEdit && id) {
        await productService.updateProduct(id, payload)
        productId = id
        toast.success('Product updated')
      } else {
        const created = await productService.createProduct(payload)
        productId = created.id
        toast.success('Product created')
      }

      // Upload any pending images
      if (pendingFiles.length) {
        setImageUploading(true)
        for (let i = 0; i < pendingFiles.length; i++) {
          const isPrimary = !existingImages?.length && i === 0
          await productService.uploadProductImage(productId, pendingFiles[i], isPrimary)
        }
        setImageUploading(false)
      }

      navigate('/admin/products')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save product'
      toast.error(msg)
    } finally {
      setSaving(false)
      setImageUploading(false)
    }
  }

  if (loading) return <PageLoading />

  const categoryOptions = [
    { value: '', label: '— No Category —' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-6 pb-10">
        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/admin/products')}
            >
              Products
            </Button>
            <div className="h-5 w-px bg-dark-200" />
            <h1 className="text-xl font-bold text-dark-900">
              {isEdit ? 'Edit Product' : 'New Product'}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              leftIcon={<Save className="w-4 h-4" />}
              loading={saving || imageUploading}
            >
              {isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Left column (2/3) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic info */}
            <Section title="Basic Information">
              <Input
                label="Product Name"
                required
                value={form.name}
                onChange={handleNameChange}
                placeholder="e.g. Urea Fertilizer 50KG"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Slug"
                  value={form.slug}
                  onChange={set('slug')}
                  hint="Auto-generated from name"
                  placeholder="urea-fertilizer-50kg"
                />
                <Input
                  label="SKU"
                  required
                  value={form.sku}
                  onChange={set('sku')}
                  placeholder="GS-UREA-50"
                />
              </div>
              <Input
                label="Short Description"
                value={form.short_description}
                onChange={set('short_description')}
                placeholder="One sentence shown on product cards"
              />
              <Textarea
                label="Full Description"
                value={form.description}
                onChange={set('description')}
                rows={6}
                placeholder="Detailed product description..."
              />
            </Section>

            {/* Product details */}
            <Section title="Product Details">
              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Brand" value={form.brand} onChange={set('brand')} placeholder="e.g. Engro" />
                <Input label="Packaging Size" value={form.packaging_size} onChange={set('packaging_size')} placeholder="e.g. 50 KG Bag" />
                <Input label="Unit" value={form.unit} onChange={set('unit')} placeholder="e.g. KG, Litre" />
              </div>
              <Textarea
                label="Composition"
                value={form.composition}
                onChange={set('composition')}
                rows={3}
                placeholder="e.g. N: 46%, P: 0%, K: 0%"
              />
              <Textarea
                label="Usage Instructions"
                value={form.usage_instructions}
                onChange={set('usage_instructions')}
                rows={4}
                placeholder="How to apply the product..."
              />
            </Section>

            {/* Benefits */}
            <Section title="Benefits">
              {form.benefits.length > 0 && (
                <ul className="space-y-2 mb-3">
                  {form.benefits.map((b, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-lg px-3 py-2"
                    >
                      <GripVertical className="w-4 h-4 text-dark-300 shrink-0" />
                      <span className="flex-1 text-sm text-dark-800">{b}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        className="p-1 text-red-400 hover:text-red-600 rounded"
                        aria-label="Remove benefit"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a benefit..."
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBenefit() } }}
                />
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={addBenefit}
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-dark-400">Press Enter or click Add to insert a benefit.</p>
            </Section>

            {/* Specifications */}
            <Section title="Specifications">
              {form.specifications.length > 0 && (
                <div className="rounded-lg border border-dark-100 overflow-hidden mb-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-dark-50">
                        <th className="px-3 py-2 text-left text-xs font-semibold text-dark-600">Attribute</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-dark-600">Value</th>
                        <th className="px-3 py-2 w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-50">
                      {form.specifications.map((spec, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-1.5">
                            <input
                              className="w-full px-2 py-1 text-sm border border-dark-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-400"
                              value={spec.key}
                              onChange={(e) => updateSpec(idx, 'key', e.target.value)}
                              placeholder="e.g. NPK Ratio"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              className="w-full px-2 py-1 text-sm border border-dark-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-400"
                              value={spec.value}
                              onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                              placeholder="e.g. 20-10-10"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeSpec(idx)}
                              className="text-red-400 hover:text-red-600"
                              aria-label="Remove spec"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Attribute (e.g. NPK Ratio)"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpec() } }}
                />
                <Input
                  placeholder="Value (e.g. 20-10-10)"
                  value={newSpecVal}
                  onChange={(e) => setNewSpecVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpec() } }}
                />
                <Button type="button" variant="outline" leftIcon={<Plus className="w-4 h-4" />} onClick={addSpec}>
                  Add
                </Button>
              </div>
            </Section>

            {/* Images */}
            <Section title="Product Images">
              {/* Existing images */}
              {existingImages && existingImages.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative group w-24 h-24">
                      <img
                        src={img.url}
                        alt={img.alt_text ?? 'Product image'}
                        className="w-full h-full object-cover rounded-xl border-2 border-dark-200"
                      />
                      {img.is_primary && (
                        <span className="absolute top-1 left-1 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        aria-label="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending files preview */}
              {pendingFiles.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {pendingFiles.map((file, idx) => (
                    <div key={idx} className="relative group w-24 h-24">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover rounded-xl border-2 border-primary-300"
                      />
                      <span className="absolute bottom-1 left-1 right-1 text-[9px] text-center text-white bg-black/60 rounded px-1 truncate">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => removePending(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        aria-label="Remove pending image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload drop zone */}
              <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-dark-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                <Upload className="w-7 h-7 text-dark-400" />
                <span className="text-sm text-dark-600 font-medium">Click to upload images</span>
                <span className="text-xs text-dark-400">JPG, PNG, WebP · Max 5MB each</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              {(isEdit && !existingImages?.length && !pendingFiles.length) && (
                <p className="text-xs text-dark-400">No images yet. Upload at least one image.</p>
              )}
            </Section>
          </div>

          {/* ── Right column (1/3) ── */}
          <div className="space-y-6">
            {/* Status & publish */}
            <div className="bg-white rounded-xl border border-dark-100 p-6 space-y-5">
              <h2 className="text-base font-bold text-dark-900 pb-4 border-b border-dark-100">Publish</h2>
              <Select
                label="Status"
                value={form.status}
                onChange={set('status')}
                options={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'PUBLISHED', label: 'Published' },
                  { value: 'ARCHIVED', label: 'Archived' },
                ]}
              />
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                  <div className="w-10 h-6 bg-dark-200 peer-checked:bg-primary-600 rounded-full transition-colors" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <span className="text-sm font-medium text-dark-700">Featured on homepage</span>
              </label>
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl border border-dark-100 p-6 space-y-4">
              <h2 className="text-base font-bold text-dark-900 pb-4 border-b border-dark-100">Category</h2>
              <Select
                label="Category"
                value={form.category_id}
                onChange={set('category_id')}
                options={categoryOptions}
              />
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border border-dark-100 p-6 space-y-4">
              <h2 className="text-base font-bold text-dark-900 pb-4 border-b border-dark-100">Pricing (PKR)</h2>
              <Input
                label="Selling Price"
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={set('price')}
                placeholder="0.00"
              />
              <Input
                label="Compare-at Price"
                type="number"
                min="0"
                step="0.01"
                value={form.compare_at_price}
                onChange={set('compare_at_price')}
                hint="Original/strikethrough price"
                placeholder="0.00"
              />
              <Input
                label="Cost Price"
                type="number"
                min="0"
                step="0.01"
                value={form.cost_price}
                onChange={set('cost_price')}
                hint="Internal use only"
                placeholder="0.00"
              />
              {form.price && form.compare_at_price && Number(form.compare_at_price) > Number(form.price) && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                  <Badge variant="danger" size="sm">
                    -{Math.round((1 - Number(form.price) / Number(form.compare_at_price)) * 100)}%
                  </Badge>
                  <span>discount shown to customers</span>
                </div>
              )}
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-xl border border-dark-100 p-6 space-y-4">
              <h2 className="text-base font-bold text-dark-900 pb-4 border-b border-dark-100">Inventory</h2>
              <Input
                label="Stock Quantity"
                required
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={set('stock_quantity')}
              />
              <Input
                label="Low Stock Threshold"
                type="number"
                min="0"
                value={form.low_stock_threshold}
                onChange={set('low_stock_threshold')}
                hint="Alert when stock falls below this"
              />
              {Number(form.stock_quantity) <= Number(form.low_stock_threshold) &&
                Number(form.stock_quantity) > 0 && (
                <p className="text-xs text-orange-600 font-medium">⚠ Stock is at or below threshold</p>
              )}
              {Number(form.stock_quantity) === 0 && (
                <p className="text-xs text-red-600 font-medium">✕ Product is out of stock</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
