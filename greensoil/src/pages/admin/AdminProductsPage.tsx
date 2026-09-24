import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Archive } from 'lucide-react'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/Modal'
import { productService } from '@/services/productService'
import type { Product } from '@/types/product.types'
import type { TableColumn } from '@/types/common.types'
import { formatCurrency, formatDateShort, getPrimaryImage } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await productService.getAllProducts({ search, status: statusFilter as Product['status'] || undefined }, page, 20)
    setProducts(res.data)
    setTotal(res.total)
    setTotalPages(res.totalPages)
    setLoading(false)
  }, [search, statusFilter, page])

  useEffect(() => { load() }, [load])

  const handleArchive = async () => {
    if (!archiveTarget) return
    try {
      await productService.archiveProduct(archiveTarget.id)
      toast.success('Product archived')
      setArchiveTarget(null)
      load()
    } catch {
      toast.error('Failed to archive product')
    }
  }

  const statusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'default'> = {
      PUBLISHED: 'success', DRAFT: 'warning', ARCHIVED: 'default',
    }
    return <Badge variant={variants[status] ?? 'default'} size="sm">{status}</Badge>
  }

  const columns: TableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <img
            src={getPrimaryImage(row.images)}
            alt={row.name}
            className="w-9 h-9 rounded-lg object-cover border border-dark-100"
          />
          <div>
            <p className="font-medium text-dark-900 line-clamp-1">{row.name}</p>
            <p className="text-xs text-dark-400">{row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (_, row) => row.category?.name ?? '—',
    },
    {
      key: 'price',
      header: 'Price',
      render: (_, row) => <span className="font-semibold">{formatCurrency(row.price)}</span>,
    },
    {
      key: 'stock_quantity',
      header: 'Stock',
      render: (_, row) => (
        <span className={row.stock_quantity <= row.low_stock_threshold ? 'text-orange-600 font-semibold' : ''}>
          {row.stock_quantity}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => statusBadge(row.status),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (_, row) => formatDateShort(row.created_at),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/admin/products/${row.id}/edit`)}
            className="p-1.5 text-dark-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            aria-label="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setArchiveTarget(row)}
            className="p-1.5 text-dark-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Archive"
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Products</h1>
          <p className="text-dark-500 text-sm mt-0.5">{total} total products</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/admin/products/new')}>
          Add Product
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-dark-100 p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-40">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'PUBLISHED', label: 'Published' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => navigate(`/admin/products/${row.id}/edit`)}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={20}
        onPageChange={setPage}
        emptyTitle="No products found"
      />

      <ConfirmDialog
        open={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="Archive Product"
        message={`Are you sure you want to archive "${archiveTarget?.name}"? It will no longer be visible on the store.`}
        confirmLabel="Archive"
      />
    </div>
  )
}
