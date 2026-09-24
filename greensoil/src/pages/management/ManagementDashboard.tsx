import { useEffect, useState } from 'react'
import { TrendingUp, ShoppingCart, Package, Users, BarChart3 } from 'lucide-react'
import { DashboardCard } from '@/components/ui/Card'
import { PageLoading } from '@/components/ui/LoadingSpinner'
import { orderService } from '@/services/orderService'
import { employeeService } from '@/services/employeeService'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ManagementDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [orderStats, setOrderStats] = useState<Awaited<ReturnType<typeof orderService.getOrderStats>> | null>(null)
  const [empStats, setEmpStats] = useState<Awaited<ReturnType<typeof employeeService.getEmployeeStats>> | null>(null)

  useEffect(() => {
    Promise.all([
      orderService.getOrderStats(),
      employeeService.getEmployeeStats(),
    ]).then(([o, e]) => {
      setOrderStats(o)
      setEmpStats(e)
      setLoading(false)
    })
  }, [])

  const salesData = MONTHS.slice(0, new Date().getMonth() + 1).map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 300000) + 80000,
    orders: Math.floor(Math.random() * 60) + 15,
  }))

  const orderStatusData = [
    { name: 'Delivered', value: orderStats?.delivered ?? 0 },
    { name: 'Pending', value: orderStats?.pending ?? 0 },
    { name: 'Cancelled', value: orderStats?.cancelled ?? 0 },
  ].filter((d) => d.value > 0)

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Management Dashboard</h1>
        <p className="text-dark-500 text-sm mt-1">
          Welcome, {user?.profile?.full_name}. Here's your business overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Revenue"
          value={formatCurrency(orderStats?.totalRevenue ?? 0)}
          icon={<TrendingUp className="w-5 h-5 text-primary-600" />}
          iconBg="bg-primary-100"
        />
        <DashboardCard
          title="Total Orders"
          value={orderStats?.total ?? 0}
          icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <DashboardCard
          title="This Month Revenue"
          value={formatCurrency(orderStats?.thisMonthRevenue ?? 0)}
          icon={<BarChart3 className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-100"
        />
        <DashboardCard
          title="Active Employees"
          value={empStats?.active ?? 0}
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-100"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-dark-100 p-6">
          <h3 className="font-bold text-dark-900 mb-4">Revenue Trend (PKR)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order status breakdown */}
        <div className="bg-white rounded-xl border border-dark-100 p-6">
          <h3 className="font-bold text-dark-900 mb-4">Order Status</h3>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {orderStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-dark-400 text-sm">
              No order data yet
            </div>
          )}
        </div>
      </div>

      {/* Employee breakdown */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: empStats?.total ?? 0, color: 'bg-dark-100 text-dark-700' },
          { label: 'Active', value: empStats?.active ?? 0, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'On Leave', value: empStats?.onLeave ?? 0, color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Inactive', value: empStats?.inactive ?? 0, color: 'bg-red-100 text-red-700' },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl p-4 ${item.color}`}>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-sm mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
