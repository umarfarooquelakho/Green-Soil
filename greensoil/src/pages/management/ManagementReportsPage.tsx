import { useEffect, useState, useCallback } from 'react'
import { useLocation, Link } from 'react-router-dom'
import {
  BarChart3, TrendingUp, Package, Users,
  Download, Calendar, CheckCircle, Clock,
  AlertTriangle, UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/constants'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts'
import type { EmploymentStatus } from '@/types/database.types'

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderRow { status: string; total_amount: number; created_at: string; payment_method: string }
interface ProductRow { id: string; name: string; sku: string; stock_quantity: number; low_stock_threshold: number; price: number; status: string; category: { name: string } | null }
interface EmployeeRow { employment_status: EmploymentStatus; designation: string | null; joining_date: string | null; department: { name: string } | null; profile: { full_name: string | null } | null }
interface MonthlyData  { month: string; revenue: number; orders: number }

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#16a34a', PENDING: '#f59e0b', CONFIRMED: '#3b82f6',
  PROCESSING: '#8b5cf6', SHIPPED: '#06b6d4', CANCELLED: '#ef4444', RETURNED: '#f97316',
}
const EMP_COLORS: Record<string, string> = { ACTIVE: '#16a34a', ON_LEAVE: '#f59e0b', INACTIVE: '#94a3b8', RESIGNED: '#ef4444' }

const RANGE_OPTIONS = [
  { value: '30',  label: 'Last 30 days' },
  { value: '90',  label: 'Last 90 days' },
  { value: '180', label: 'Last 6 months' },
  { value: '365', label: 'Last year' },
  { value: 'all', label: 'All time' },
]

const TABS = [
  { label: 'Overview',   href: '/management/reports',   icon: BarChart3  },
  { label: 'Sales',      href: '/management/sales',     icon: TrendingUp  },
  { label: 'Inventory',  href: '/management/inventory', icon: Package     },
  { label: 'Employees',  href: '/management/employees', icon: Users       },
]

// ─── CSV helper ───────────────────────────────────────────────────────────────
function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// ─── Shared stat card ─────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, bg }: {
  label: string; value: string | number; sub?: string
  icon: React.ReactNode; bg: string
}) {
  return (
    <div className="bg-white rounded-xl border border-dark-100 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-dark-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-dark-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-dark-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ManagementReportsPage() {
  const { pathname } = useLocation()

  // Active tab derived from route
  const activeTab =
    pathname.includes('/sales')      ? 'sales'
    : pathname.includes('/inventory') ? 'inventory'
    : pathname.includes('/employees') ? 'employees'
    : 'overview'

  const [range, setRange] = useState('90')
  const [orders,    setOrders]    = useState<OrderRow[]>([])
  const [products,  setProducts]  = useState<ProductRow[]>([])
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  const [loading,   setLoading]   = useState(true)

  const load = useCallback(async () => {
    setLoading(true)

    const dateFilter = range !== 'all'
      ? new Date(Date.now() - Number(range) * 86400000).toISOString()
      : null

    const [ordersRes, productsRes, employeesRes] = await Promise.all([
      // Orders (always scoped to date range)
      (() => {
        let q = supabase
          .from('orders')
          .select('status, total_amount, created_at, payment_method')
          .order('created_at', { ascending: false })
        if (dateFilter) q = q.gte('created_at', dateFilter)
        return q
      })(),

      // Products (all, for inventory tab)
      supabase
        .from('products')
        .select('id, name, sku, stock_quantity, low_stock_threshold, price, status, product_categories(name)')
        .is('deleted_at', null)
        .order('name', { ascending: true }),

      // Employees (all)
      supabase
        .from('employees')
        .select('employment_status, designation, joining_date, departments(name), profiles(full_name)')
        .is('deleted_at', null),
    ])

    setOrders((ordersRes.data ?? []) as OrderRow[])
    setProducts(
      ((productsRes.data ?? []) as unknown[]).map((p: unknown) => {
        const row = p as { product_categories?: { name: string } | null } & Omit<ProductRow, 'category'>
        return { ...row, category: row.product_categories ?? null } as ProductRow
      })
    )
    setEmployees(
      ((employeesRes.data ?? []) as unknown[]).map((e: unknown) => {
        const row = e as { departments?: { name: string } | null; profiles?: { full_name: string | null } | null } & Omit<EmployeeRow, 'department' | 'profile'>
        return { ...row, department: row.departments ?? null, profile: row.profiles ?? null } as EmployeeRow
      })
    )
    setLoading(false)
  }, [range])

  useEffect(() => { load() }, [load])

  // ─── Derived: orders ────────────────────────────────────────────────────────
  const totalRevenue    = orders.reduce((s, o) => s + o.total_amount, 0)
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED')
  const deliveredRevenue = deliveredOrders.reduce((s, o) => s + o.total_amount, 0)
  const cancelledCount  = orders.filter((o) => o.status === 'CANCELLED').length
  const avgOrder        = orders.length > 0 ? totalRevenue / orders.length : 0

  // Monthly aggregation
  const monthlyMap: Record<string, MonthlyData> = {}
  orders.forEach((o) => {
    const d   = new Date(o.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyMap[key]) monthlyMap[key] = { month: MONTH_SHORT[d.getMonth()], revenue: 0, orders: 0 }
    monthlyMap[key].revenue += o.total_amount
    monthlyMap[key].orders  += 1
  })
  const monthlyData: MonthlyData[] = Object.keys(monthlyMap).sort().map((k) => monthlyMap[k])

  // Status split
  const statusMap: Record<string, number> = {}
  orders.forEach((o) => { statusMap[o.status] = (statusMap[o.status] ?? 0) + 1 })
  const statusPieData = Object.entries(statusMap).map(([s, v]) => ({
    name: ORDER_STATUSES.find((x) => x.value === s)?.label ?? s,
    value: v,
    color: STATUS_COLORS[s] ?? '#94a3b8',
  }))

  // ─── Derived: inventory ──────────────────────────────────────────────────────
  const publishedProducts  = products.filter((p) => p.status === 'PUBLISHED')
  const lowStockProducts   = products.filter((p) => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0)
  const outOfStockProducts = products.filter((p) => p.stock_quantity === 0)
  const totalStockValue    = products.reduce((s, p) => s + p.stock_quantity * p.price, 0)

  const categoryMap: Record<string, number> = {}
  products.forEach((p) => {
    const cat = p.category?.name ?? 'Uncategorised'
    categoryMap[cat] = (categoryMap[cat] ?? 0) + 1
  })
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

  // ─── Derived: employees ──────────────────────────────────────────────────────
  const empStats = {
    total:    employees.length,
    active:   employees.filter((e) => e.employment_status === 'ACTIVE').length,
    onLeave:  employees.filter((e) => e.employment_status === 'ON_LEAVE').length,
    inactive: employees.filter((e) => e.employment_status === 'INACTIVE').length,
    resigned: employees.filter((e) => e.employment_status === 'RESIGNED').length,
  }

  const deptMap: Record<string, number> = {}
  employees.forEach((e) => {
    const dept = e.department?.name ?? 'Unassigned'
    deptMap[dept] = (deptMap[dept] ?? 0) + 1
  })
  const deptData = Object.entries(deptMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const empStatusPie = [
    { name: 'Active',   value: empStats.active,   color: EMP_COLORS.ACTIVE },
    { name: 'On Leave', value: empStats.onLeave,  color: EMP_COLORS.ON_LEAVE },
    { name: 'Inactive', value: empStats.inactive, color: EMP_COLORS.INACTIVE },
    { name: 'Resigned', value: empStats.resigned, color: EMP_COLORS.RESIGNED },
  ].filter((d) => d.value > 0)

  // ─── CSV exports ────────────────────────────────────────────────────────────
  const exportSales = () => {
    const header = ['Date','Status','Payment','Revenue (PKR)']
    downloadCSV(
      [header, ...orders.map((o) => [formatDateShort(o.created_at), o.status, o.payment_method, String(o.total_amount)])],
      `sales-${new Date().toISOString().slice(0,10)}.csv`
    )
  }
  const exportInventory = () => {
    const header = ['SKU','Name','Category','Status','Stock','Low-Stock Threshold','Price (PKR)']
    downloadCSV(
      [header, ...products.map((p) => [p.sku, p.name, p.category?.name ?? '', p.status, String(p.stock_quantity), String(p.low_stock_threshold), String(p.price)])],
      `inventory-${new Date().toISOString().slice(0,10)}.csv`
    )
  }
  const exportEmployees = () => {
    const header = ['Name','Designation','Department','Status','Joined']
    downloadCSV(
      [header, ...employees.map((e) => [e.profile?.full_name ?? '', e.designation ?? '', e.department?.name ?? '', e.employment_status, e.joining_date ? formatDateShort(e.joining_date) : ''])],
      `employees-${new Date().toISOString().slice(0,10)}.csv`
    )
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-dark-900">
          {activeTab === 'overview'  && 'Business Overview'}
          {activeTab === 'sales'     && 'Sales Report'}
          {activeTab === 'inventory' && 'Inventory Report'}
          {activeTab === 'employees' && 'Employees Report'}
        </h1>
        <div className="flex items-center gap-3">
          {(activeTab === 'overview' || activeTab === 'sales') && (
            <>
              <Calendar className="w-4 h-4 text-dark-400" />
              <div className="w-44">
                <Select value={range} onChange={(e) => setRange(e.target.value)} options={RANGE_OPTIONS} />
              </div>
              <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={exportSales}>
                Export CSV
              </Button>
            </>
          )}
          {activeTab === 'inventory' && (
            <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={exportInventory}>
              Export CSV
            </Button>
          )}
          {activeTab === 'employees' && (
            <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={exportEmployees}>
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-dark-100 overflow-x-auto">
        {TABS.map((tab) => {
          const active = activeTab === tab.href.split('/').pop()
                      || (activeTab === 'overview' && tab.href === '/management/reports')
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-dark-500 hover:text-dark-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* ══════════════ OVERVIEW TAB ══════════════ */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Revenue"    value={formatCurrency(totalRevenue)}    icon={<TrendingUp className="w-5 h-5 text-primary-600" />} bg="bg-primary-100" />
            <KpiCard label="Total Orders"     value={orders.length}                  sub={`Avg ${formatCurrency(avgOrder)}`} icon={<BarChart3 className="w-5 h-5 text-blue-600" />} bg="bg-blue-100" />
            <KpiCard label="Published Products" value={publishedProducts.length}     sub={`${lowStockProducts.length} low stock`} icon={<Package className="w-5 h-5 text-purple-600" />} bg="bg-purple-100" />
            <KpiCard label="Active Employees" value={empStats.active}               sub={`${empStats.total} total`} icon={<UserCheck className="w-5 h-5 text-emerald-600" />} bg="bg-emerald-100" />
          </div>

          {/* Revenue trend */}
          <div className="bg-white rounded-xl border border-dark-100 p-6">
            <h2 className="font-bold text-dark-900 mb-5">Revenue Trend (PKR)</h2>
            {monthlyData.length === 0 ? (
              <p className="text-center py-10 text-dark-400 text-sm">No data for this period</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Order status */}
            <div className="bg-white rounded-xl border border-dark-100 p-6">
              <h2 className="font-bold text-dark-900 mb-5">Order Status Split</h2>
              {statusPieData.length === 0 ? (
                <p className="text-center py-10 text-dark-400 text-sm">No orders yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                      {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Inventory alerts */}
            <div className="bg-white rounded-xl border border-dark-100 p-6">
              <h2 className="font-bold text-dark-900 mb-5">Inventory Alerts</h2>
              <div className="space-y-3">
                {[
                  { label: 'Out of Stock',     value: outOfStockProducts.length, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
                  { label: 'Low Stock',        value: lowStockProducts.length,   icon: Clock,         color: 'text-orange-600 bg-orange-50' },
                  { label: 'Stock Value (PKR)',value: formatCurrency(totalStockValue), icon: Package,  color: 'text-primary-600 bg-primary-50' },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${item.color}`}>
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="flex-1 font-medium text-sm">{item.label}</span>
                    <span className="font-bold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════ SALES TAB ══════════════ */}
      {activeTab === 'sales' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Revenue"    value={formatCurrency(totalRevenue)}    icon={<TrendingUp className="w-5 h-5 text-primary-600" />} bg="bg-primary-100" />
            <KpiCard label="Orders"           value={orders.length}                  sub={`Avg ${formatCurrency(avgOrder)}`} icon={<BarChart3 className="w-5 h-5 text-blue-600" />} bg="bg-blue-100" />
            <KpiCard label="Delivered Revenue" value={formatCurrency(deliveredRevenue)} sub={`${deliveredOrders.length} orders`} icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} bg="bg-emerald-100" />
            <KpiCard label="Cancelled"        value={cancelledCount}                  icon={<Clock className="w-5 h-5 text-red-500" />} bg="bg-red-100" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-dark-100 p-6">
              <h2 className="font-bold text-dark-900 mb-5">Monthly Revenue (PKR)</h2>
              {monthlyData.length === 0 ? (
                <p className="text-center py-10 text-dark-400 text-sm">No data for this period</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-xl border border-dark-100 p-6">
              <h2 className="font-bold text-dark-900 mb-5">Monthly Orders</h2>
              {monthlyData.length === 0 ? (
                <p className="text-center py-10 text-dark-400 text-sm">No data for this period</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#16a34a" radius={[4,4,0,0]} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Status breakdown table */}
          <div className="bg-white rounded-xl border border-dark-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-dark-100">
              <h2 className="font-bold text-dark-900">Orders by Status</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-dark-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-600 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-dark-600 uppercase tracking-wide">Count</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-dark-600 uppercase tracking-wide">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {statusPieData.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-dark-400">No orders yet</td></tr>
                ) : statusPieData.map((s) => (
                  <tr key={s.name} className="hover:bg-dark-50/50">
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                        <span className="font-medium text-dark-900">{s.name}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-dark-900">{s.value}</td>
                    <td className="px-6 py-3 text-right text-dark-500">
                      {orders.length > 0 ? `${Math.round(s.value / orders.length * 100)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══════════════ INVENTORY TAB ══════════════ */}
      {activeTab === 'inventory' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Products"    value={products.length}              icon={<Package className="w-5 h-5 text-primary-600" />} bg="bg-primary-100" />
            <KpiCard label="Published"         value={publishedProducts.length}     icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} bg="bg-emerald-100" />
            <KpiCard label="Low Stock"         value={lowStockProducts.length}      icon={<AlertTriangle className="w-5 h-5 text-orange-500" />} bg="bg-orange-100" />
            <KpiCard label="Stock Value (PKR)" value={formatCurrency(totalStockValue)} icon={<TrendingUp className="w-5 h-5 text-blue-600" />} bg="bg-blue-100" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Products by category */}
            <div className="bg-white rounded-xl border border-dark-100 p-6">
              <h2 className="font-bold text-dark-900 mb-5">Products by Category</h2>
              {categoryData.length === 0 ? (
                <p className="text-center py-10 text-dark-400 text-sm">No products yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#16a34a" radius={[0,4,4,0]} name="Products" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Stock alerts */}
            <div className="bg-white rounded-xl border border-dark-100 p-6">
              <h2 className="font-bold text-dark-900 mb-5">Low / Out of Stock Products</h2>
              {outOfStockProducts.length === 0 && lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-emerald-600 gap-2">
                  <CheckCircle className="w-10 h-10" />
                  <p className="font-medium text-sm">All products are well-stocked</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {[...outOfStockProducts, ...lowStockProducts].map((p) => (
                    <div key={p.id} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${p.stock_quantity === 0 ? 'bg-red-50' : 'bg-orange-50'}`}>
                      <div className="min-w-0">
                        <p className="font-medium text-dark-800 truncate">{p.name}</p>
                        <p className="text-xs text-dark-400">{p.sku}</p>
                      </div>
                      <Badge variant={p.stock_quantity === 0 ? 'danger' : 'warning'} size="sm">
                        {p.stock_quantity === 0 ? 'Out of Stock' : `${p.stock_quantity} left`}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full inventory table */}
          <div className="bg-white rounded-xl border border-dark-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100">
              <h2 className="font-bold text-dark-900">Full Inventory</h2>
              <span className="text-sm text-dark-500">{products.length} products</span>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-dark-50 z-10">
                  <tr>
                    {['SKU', 'Name', 'Category', 'Status', 'Stock', 'Price (PKR)'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-dark-600 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-50">
                  {products.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-dark-400">No products</td></tr>
                  ) : products.map((p) => (
                    <tr key={p.id} className="hover:bg-dark-50/50">
                      <td className="px-4 py-2.5 font-mono text-xs text-dark-500">{p.sku}</td>
                      <td className="px-4 py-2.5 font-medium text-dark-900 max-w-[200px] truncate">{p.name}</td>
                      <td className="px-4 py-2.5 text-dark-600">{p.category?.name ?? '—'}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={p.status === 'PUBLISHED' ? 'success' : p.status === 'DRAFT' ? 'warning' : 'default'} size="sm">
                          {p.status}
                        </Badge>
                      </td>
                      <td className={`px-4 py-2.5 font-semibold ${p.stock_quantity === 0 ? 'text-red-600' : p.stock_quantity <= p.low_stock_threshold ? 'text-orange-600' : 'text-dark-900'}`}>
                        {p.stock_quantity}
                      </td>
                      <td className="px-4 py-2.5 text-dark-700">{formatCurrency(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ══════════════ EMPLOYEES TAB ══════════════ */}
      {activeTab === 'employees' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Employees" value={empStats.total}    icon={<Users className="w-5 h-5 text-primary-600" />} bg="bg-primary-100" />
            <KpiCard label="Active"          value={empStats.active}   icon={<UserCheck className="w-5 h-5 text-emerald-600" />} bg="bg-emerald-100" />
            <KpiCard label="On Leave"        value={empStats.onLeave}  icon={<Clock className="w-5 h-5 text-yellow-600" />} bg="bg-yellow-100" />
            <KpiCard label="Inactive / Resigned" value={`${empStats.inactive} / ${empStats.resigned}`} icon={<AlertTriangle className="w-5 h-5 text-red-500" />} bg="bg-red-100" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Status pie */}
            <div className="bg-white rounded-xl border border-dark-100 p-6">
              <h2 className="font-bold text-dark-900 mb-5">Employment Status</h2>
              {empStatusPie.length === 0 ? (
                <p className="text-center py-10 text-dark-400 text-sm">No employees yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={empStatusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                      {empStatusPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Department bar */}
            <div className="bg-white rounded-xl border border-dark-100 p-6">
              <h2 className="font-bold text-dark-900 mb-5">Employees by Department</h2>
              {deptData.length === 0 ? (
                <p className="text-center py-10 text-dark-400 text-sm">No department data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={deptData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#16a34a" radius={[0,4,4,0]} name="Employees" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Employee roster */}
          <div className="bg-white rounded-xl border border-dark-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100">
              <h2 className="font-bold text-dark-900">Employee Roster</h2>
              <span className="text-sm text-dark-500">{employees.length} employees</span>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-dark-50 z-10">
                  <tr>
                    {['Name', 'Designation', 'Department', 'Status', 'Joined'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-dark-600 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-50">
                  {employees.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-dark-400">No employees</td></tr>
                  ) : employees.map((e, idx) => (
                    <tr key={idx} className="hover:bg-dark-50/50">
                      <td className="px-4 py-2.5 font-medium text-dark-900">{e.profile?.full_name ?? '—'}</td>
                      <td className="px-4 py-2.5 text-dark-600">{e.designation ?? '—'}</td>
                      <td className="px-4 py-2.5 text-dark-600">{e.department?.name ?? '—'}</td>
                      <td className="px-4 py-2.5">
                        <Badge
                          variant={
                            e.employment_status === 'ACTIVE'   ? 'success'
                            : e.employment_status === 'ON_LEAVE' ? 'warning'
                            : e.employment_status === 'RESIGNED' ? 'danger'
                            : 'default'
                          }
                          size="sm"
                        >
                          {e.employment_status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-dark-500">{e.joining_date ? formatDateShort(e.joining_date) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
