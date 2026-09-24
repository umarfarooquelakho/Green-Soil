import { useEffect, useState, useCallback } from 'react'
import {
  TrendingUp, ShoppingCart, Package, Download,
  Calendar, CheckCircle, XCircle, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────
interface RawOrder {
  id: string
  order_number: string
  status: string
  payment_method: string
  payment_status: string
  total_amount: number
  created_at: string
  order_items: { product_name_snapshot: string; quantity: number; subtotal: number }[]
}

interface MonthlyData { month: string; revenue: number; orders: number }
interface ProductSale { name: string; qty: number; revenue: number }
interface StatusData  { name: string; value: number; color: string }

const STATUS_COLORS: Record<string, string> = {
  DELIVERED:  '#16a34a',
  PENDING:    '#f59e0b',
  CONFIRMED:  '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED:    '#06b6d4',
  CANCELLED:  '#ef4444',
  RETURNED:   '#f97316',
}

const RANGE_OPTIONS = [
  { value: '30',  label: 'Last 30 Days' },
  { value: '90',  label: 'Last 90 Days' },
  { value: '180', label: 'Last 6 Months' },
  { value: '365', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
]

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ─── CSV helper ───────────────────────────────────────────────────────────────
function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon, color,
}: { label: string; value: string; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-white rounded-xl border border-dark-100 p-5 flex items-start gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-dark-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-dark-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-dark-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const [range, setRange] = useState('90')
  const [orders, setOrders] = useState<RawOrder[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('orders')
      .select(`
        id, order_number, status, payment_method, payment_status,
        total_amount, created_at,
        order_items (product_name_snapshot, quantity, subtotal)
      `)
      .order('created_at', { ascending: false })

    if (range !== 'all') {
      const from = new Date()
      from.setDate(from.getDate() - Number(range))
      query = query.gte('created_at', from.toISOString())
    }

    const { data } = await query
    setOrders((data ?? []) as RawOrder[])
    setLoading(false)
  }, [range])

  useEffect(() => { load() }, [load])

  // ─── Derived metrics ────────────────────────────────────────────────────────
  const totalRevenue   = orders.reduce((s, o) => s + o.total_amount, 0)
  const totalOrders    = orders.length
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length
  const cancelledCount = orders.filter((o) => o.status === 'CANCELLED').length
  const pendingCount   = orders.filter((o) => o.status === 'PENDING').length
  const avgOrderValue  = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Monthly revenue + order counts
  const monthlyMap: Record<string, MonthlyData> = {}
  orders.forEach((o) => {
    const d    = new Date(o.created_at)
    const key  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const mon  = MONTH_LABELS[d.getMonth()]
    if (!monthlyMap[key]) monthlyMap[key] = { month: mon, revenue: 0, orders: 0 }
    monthlyMap[key].revenue += o.total_amount
    monthlyMap[key].orders  += 1
  })
  const monthlyData: MonthlyData[] = Object.keys(monthlyMap)
    .sort()
    .map((k) => monthlyMap[k])

  // Order status breakdown
  const statusMap: Record<string, number> = {}
  orders.forEach((o) => { statusMap[o.status] = (statusMap[o.status] ?? 0) + 1 })
  const statusData: StatusData[] = Object.entries(statusMap).map(([name, value]) => ({
    name: ORDER_STATUSES.find((s) => s.value === name)?.label ?? name,
    value,
    color: STATUS_COLORS[name] ?? '#94a3b8',
  }))

  // Top products by revenue
  const productMap: Record<string, ProductSale> = {}
  orders.forEach((o) => {
    o.order_items.forEach((item) => {
      const name = item.product_name_snapshot
      if (!productMap[name]) productMap[name] = { name, qty: 0, revenue: 0 }
      productMap[name].qty     += item.quantity
      productMap[name].revenue += item.subtotal
    })
  })
  const topProducts: ProductSale[] = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Payment method split
  const paymentMap: Record<string, number> = {}
  orders.forEach((o) => { paymentMap[o.payment_method] = (paymentMap[o.payment_method] ?? 0) + 1 })
  const paymentData = Object.entries(paymentMap).map(([name, value]) => ({
    name: name === 'COD' ? 'Cash on Delivery' : 'Bank Transfer',
    value,
  }))

  // ─── CSV exports ────────────────────────────────────────────────────────────
  const exportOrders = () => {
    const header = ['Order No.', 'Date', 'Status', 'Payment', 'Payment Status', 'Total (PKR)']
    const rows = orders.map((o) => [
      o.order_number,
      formatDateShort(o.created_at),
      o.status,
      o.payment_method,
      o.payment_status,
      String(o.total_amount),
    ])
    downloadCSV([header, ...rows], `orders-report-${new Date().toISOString().slice(0,10)}.csv`)
  }

  const exportProducts = () => {
    const header = ['Product', 'Units Sold', 'Revenue (PKR)']
    const rows = topProducts.map((p) => [p.name, String(p.qty), String(p.revenue)])
    downloadCSV([header, ...rows], `products-report-${new Date().toISOString().slice(0,10)}.csv`)
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Reports</h1>
          <p className="text-dark-500 text-sm mt-0.5">Sales and order analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-dark-400" />
          <div className="w-44">
            <Select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              options={RANGE_OPTIONS}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={exportOrders}
          >
            Export Orders
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<TrendingUp className="w-5 h-5 text-primary-600" />}
          color="bg-primary-100"
        />
        <StatCard
          label="Total Orders"
          value={String(totalOrders)}
          sub={`Avg ${formatCurrency(avgOrderValue)} / order`}
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          label="Delivered"
          value={String(deliveredCount)}
          sub={totalOrders > 0 ? `${Math.round(deliveredCount / totalOrders * 100)}% completion` : undefined}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          color="bg-emerald-100"
        />
        <StatCard
          label="Pending / Cancelled"
          value={`${pendingCount} / ${cancelledCount}`}
          icon={<Clock className="w-5 h-5 text-orange-500" />}
          color="bg-orange-100"
        />
      </div>

      {/* ── Revenue trend ── */}
      <div className="bg-white rounded-xl border border-dark-100 p-6">
        <h2 className="font-bold text-dark-900 mb-5">Revenue Trend (PKR)</h2>
        {monthlyData.length === 0 ? (
          <p className="text-center text-dark-400 py-12 text-sm">No data for this period</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
              <Line
                type="monotone" dataKey="revenue" stroke="#16a34a"
                strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Orders per month + Status split ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-dark-100 p-6">
          <h2 className="font-bold text-dark-900 mb-5">Orders per Month</h2>
          {monthlyData.length === 0 ? (
            <p className="text-center text-dark-400 py-12 text-sm">No data for this period</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#16a34a" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-dark-100 p-6">
          <h2 className="font-bold text-dark-900 mb-5">Order Status Breakdown</h2>
          {statusData.length === 0 ? (
            <p className="text-center text-dark-400 py-12 text-sm">No orders yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData} cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Top products ── */}
      <div className="bg-white rounded-xl border border-dark-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100">
          <h2 className="font-bold text-dark-900">Top Products by Revenue</h2>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={exportProducts}
          >
            Export
          </Button>
        </div>
        {topProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-dark-400">
            <Package className="w-8 h-8 mb-2" />
            <p className="text-sm">No sales data for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-dark-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-600 uppercase tracking-wide">Product</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-dark-600 uppercase tracking-wide">Units Sold</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-dark-600 uppercase tracking-wide">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-dark-600 uppercase tracking-wide">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-dark-50/50">
                    <td className="px-6 py-3 font-medium text-dark-900">{p.name}</td>
                    <td className="px-6 py-3 text-right text-dark-600">{p.qty.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right font-semibold text-dark-900">{formatCurrency(p.revenue)}</td>
                    <td className="px-6 py-3 text-right text-dark-500">
                      {totalRevenue > 0 ? `${Math.round(p.revenue / totalRevenue * 100)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-dark-50 border-t border-dark-200">
                  <td className="px-6 py-3 font-bold text-dark-900">Total</td>
                  <td className="px-6 py-3 text-right font-bold text-dark-900">
                    {topProducts.reduce((s, p) => s + p.qty, 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-dark-900">
                    {formatCurrency(topProducts.reduce((s, p) => s + p.revenue, 0))}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ── Payment method split ── */}
      <div className="bg-white rounded-xl border border-dark-100 p-6">
        <h2 className="font-bold text-dark-900 mb-5">Payment Methods</h2>
        <div className="flex flex-wrap gap-6 items-center">
          {paymentData.length === 0 ? (
            <p className="text-dark-400 text-sm">No payment data</p>
          ) : (
            paymentData.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-primary-600" aria-hidden />
                </div>
                <div>
                  <p className="font-bold text-dark-900 text-lg">{p.value}</p>
                  <p className="text-xs text-dark-500">{p.name}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
