import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input, Select } from '@/components/ui/Input'
import { DataTable } from '@/components/ui/DataTable'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/ui/Badge'
import { orderService } from '@/services/orderService'
import type { Order, OrderFilters } from '@/types/order.types'
import type { TableColumn } from '@/types/common.types'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'

export default function AdminOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<OrderFilters>({})

  const load = useCallback(async () => {
    setLoading(true)
    const res = await orderService.getAllOrders(filters, page, 20)
    setOrders(res.data)
    setTotal(res.total)
    setTotalPages(res.totalPages)
    setLoading(false)
  }, [filters, page])

  useEffect(() => { load() }, [load])

  const columns: TableColumn<Order>[] = [
    {
      key: 'order_number',
      header: 'Order No.',
      render: (_, row) => (
        <span className="font-mono font-semibold text-primary-700">{row.order_number}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (_, row) => formatDateShort(row.created_at),
    },
    {
      key: 'customer_id',
      header: 'Customer',
      render: (_, row) => (
        <span className="text-dark-700">{(row.shipping_address as { full_name?: string })?.full_name ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => <OrderStatusBadge status={row.status} />,
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (_, row) => <PaymentStatusBadge status={row.payment_status} />,
    },
    {
      key: 'total_amount',
      header: 'Total',
      render: (_, row) => (
        <span className="font-bold">{formatCurrency(row.total_amount)}</span>
      ),
    },
  ]

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label })),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Orders</h1>
          <p className="text-dark-500 text-sm mt-0.5">{total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-dark-100 p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search order number..."
            value={filters.search ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-40">
          <Select
            value={filters.status ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as Order['status'] || undefined }))}
            options={statusOptions}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={20}
        onPageChange={setPage}
        emptyTitle="No orders found"
      />
    </div>
  )
}
