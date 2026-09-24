import { useEffect, useState, useCallback } from 'react'
import { Search, Users } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { DataTable } from '@/components/ui/DataTable'
import { supabase } from '@/lib/supabase'
import type { TableColumn } from '@/types/common.types'
import { formatDateShort } from '@/lib/utils'

interface Customer {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  created_at: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('id, full_name, phone, created_at, roles!inner(name)', { count: 'exact' })
      .eq('roles.name', 'CUSTOMER')
      .order('created_at', { ascending: false })
      .range((page - 1) * 20, page * 20 - 1)

    if (search) {
      query = query.ilike('full_name', `%${search}%`)
    }

    const { data, count } = await query
    setCustomers((data ?? []).map((d) => ({
      id: d.id,
      email: '',
      full_name: d.full_name,
      phone: d.phone,
      created_at: d.created_at,
    })))
    setTotal(count ?? 0)
    setTotalPages(Math.ceil((count ?? 0) / 20))
    setLoading(false)
  }, [search, page])

  useEffect(() => { load() }, [load])

  const columns: TableColumn<Customer>[] = [
    {
      key: 'full_name',
      header: 'Customer',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
            {row.full_name?.[0]?.toUpperCase() ?? 'C'}
          </div>
          <span className="font-medium text-dark-900">{row.full_name ?? 'Unknown'}</span>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (_, row) => row.phone ?? '—' },
    { key: 'created_at', header: 'Joined', render: (_, row) => formatDateShort(row.created_at) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Customers</h1>
          <p className="text-dark-500 text-sm mt-0.5">{total} registered customers</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-dark-100 p-4">
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />} />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        keyExtractor={(row) => row.id}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={20}
        onPageChange={setPage}
        emptyTitle="No customers found"
        emptyDescription="Customers will appear here once they register."
      />
    </div>
  )
}
