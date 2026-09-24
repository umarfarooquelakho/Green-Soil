import { useEffect, useState } from 'react'
import {
  ShoppingCart, Package, Users, TrendingUp,
  AlertTriangle, CheckCircle, Clock, XCircle,
} from 'lucide-react'
import { DashboardCard } from '@/components/ui/Card'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { orderService } from '@/services/orderService'
import { productService } from '@/services/productService'
import { employeeService } from '@/services/employeeService'
import { formatCurrency } from '@/lib/utils'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'

interface Stats {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  deliveredOrders: number
  totalProducts: number
  lowStockProducts: number
  totalCustomers: number
  activeEmployees: number
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [orderStats, empStats] = await Promise.all([
        orderService.getOrderStats(),
        employeeService.getEmployeeStats(),
      ])

      // Products
      const { total: totalProducts, data: products } = await productService.getAllProducts({}, 1, 1000)
      const lowStockProducts = products.filter(
        (p) => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0
      ).length

      setStats({
        totalRevenue: orderStats.totalRevenue,
        totalOrders: orderStats.total,
        pendingOrders: orderStats.pending,
        deliveredOrders: orderStats.delivered,
        totalProducts,
        lowStockProducts,
        totalCustomers: 0, // Will be populated from customers table
        activeEmployees: empStats.active,
      })
      setLoading(false)
    }
    load()
  }, [])

  // Mock chart data — in production this would come from DB aggregation
  const salesData = MONTHS.slice(0, new Date().getMonth() + 1).map((month, i) => ({
    month,
    revenue: Math.floor(Math.random() * 200000) + 50000,
    orders: Math.floor(Math.random() * 50) + 10,
  }))

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Dashboard</h1>
        <p className="text-dark-500 text-sm mt-1">Overview of your business performance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          icon={<TrendingUp className="w-5 h-5 text-primary-600" />}
          iconBg="bg-primary-100"
        />
        <DashboardCard
          title="Total Orders"
          value={stats?.totalOrders ?? 0}
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <DashboardCard
          title="Total Products"
          value={stats?.totalProducts ?? 0}
          icon={<Package className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-100"
        />
        <DashboardCard
          title="Active Employees"
          value={stats?.activeEmployees ?? 0}
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-100"
        />
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Orders', value: stats?.pendingOrders ?? 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
          { label: 'Delivered Orders', value: stats?.deliveredOrders ?? 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Low Stock Products', value: stats?.lowStockProducts ?? 0, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
          { label: 'Cancelled Orders', value: 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border p-4 ${item.bg}`}>
            <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
            <p className="text-2xl font-bold text-dark-900">{item.value}</p>
            <p className="text-xs text-dark-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-xl border border-dark-100 p-6">
          <h3 className="font-bold text-dark-900 mb-4">Monthly Revenue (PKR)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders chart */}
        <div className="bg-white rounded-xl border border-dark-100 p-6">
          <h3 className="font-bold text-dark-900 mb-4">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
