import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Edit, UserCheck, X, Eye, EyeOff } from 'lucide-react'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { employeeService } from '@/services/employeeService'
import type { Employee, Department } from '@/services/employeeService'
import type { TableColumn } from '@/types/common.types'
import type { EmploymentStatus } from '@/types/database.types'
import { formatDateShort } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────
type RoleOption = 'ADMIN' | 'EMPLOYEE'

interface EmployeeForm {
  // Auth fields (new employee only)
  full_name: string
  email: string
  phone: string
  password: string
  role: RoleOption
  // Employee record fields
  employee_code: string
  department_id: string
  designation: string
  joining_date: string
  employment_status: EmploymentStatus
  address: string
}

const emptyForm = (): EmployeeForm => ({
  full_name: '',
  email: '',
  phone: '',
  password: '',
  role: 'EMPLOYEE',
  employee_code: '',
  department_id: '',
  designation: '',
  joining_date: new Date().toISOString().slice(0, 10),
  employment_status: 'ACTIVE',
  address: '',
})

const statusVariant: Record<EmploymentStatus, 'success' | 'warning' | 'danger' | 'default'> = {
  ACTIVE: 'success', ON_LEAVE: 'warning', INACTIVE: 'default', RESIGNED: 'danger',
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EmploymentStatus | ''>('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [form, setForm] = useState<EmployeeForm>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await employeeService.getEmployees(
      search, statusFilter as EmploymentStatus || undefined, page, 20
    )
    setEmployees(res.data)
    setTotal(res.total)
    setTotalPages(res.totalPages)
    setLoading(false)
  }, [search, statusFilter, page])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    employeeService.getDepartments().then(setDepartments)
  }, [])

  // ─── Open modal ─────────────────────────────────────────────────────────────
  const openNew = () => {
    setEditTarget(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  const openEdit = (emp: Employee) => {
    setEditTarget(emp)
    setForm({
      full_name: emp.profile?.full_name ?? '',
      email: '',
      phone: emp.profile?.phone ?? '',
      password: '',
      role: (emp.profile?.role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE') as RoleOption,
      employee_code: emp.employee_code,
      department_id: emp.department_id ?? '',
      designation: emp.designation ?? '',
      joining_date: emp.joining_date ?? new Date().toISOString().slice(0, 10),
      employment_status: emp.employment_status,
      address: emp.address ?? '',
    })
    setModalOpen(true)
  }

  // ─── Field setter ────────────────────────────────────────────────────────────
  const set = (key: keyof EmployeeForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  // ─── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    // Validation
    if (!form.full_name.trim()) { toast.error('Full name is required'); return }
    if (!editTarget && !form.email.trim()) { toast.error('Email is required'); return }
    if (!editTarget && form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (!form.employee_code.trim()) { toast.error('Employee code is required'); return }

    setSaving(true)
    try {
      if (editTarget) {
        // ── Edit existing employee ──
        await employeeService.updateEmployee(editTarget.id, {
          department_id: form.department_id || undefined,
          designation: form.designation || undefined,
          joining_date: form.joining_date || undefined,
          employment_status: form.employment_status,
          address: form.address || undefined,
        })

        // Update profile name/phone
        await supabase
          .from('profiles')
          .update({ full_name: form.full_name, phone: form.phone || null })
          .eq('id', editTarget.profile_id)

        toast.success('Employee updated')
      } else {
        // ── Create new employee ──

        // Step 1: Create Supabase Auth user using admin API (service role needed)
        // Since we're on the frontend, we use signUp then reassign role via SQL
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.full_name.trim(),
              phone: form.phone.trim(),
            },
          },
        })

        if (authError || !authData.user) {
          toast.error(authError?.message ?? 'Failed to create auth user')
          setSaving(false)
          return
        }

        const userId = authData.user.id

        // Step 2: Assign the correct role
        const { data: roleData } = await supabase
          .from('roles')
          .select('id')
          .eq('name', form.role)
          .single()

        if (roleData) {
          await supabase
            .from('profiles')
            .update({ role_id: roleData.id, full_name: form.full_name.trim(), phone: form.phone || null })
            .eq('id', userId)
        }

        // Step 3: Create the employee record
        await employeeService.createEmployee({
          profile_id: userId,
          employee_code: form.employee_code.trim(),
          department_id: form.department_id || undefined,
          designation: form.designation || undefined,
          joining_date: form.joining_date || undefined,
          employment_status: form.employment_status,
          address: form.address || undefined,
        })

        toast.success(`${form.role === 'ADMIN' ? 'Admin' : 'Employee'} account created! They must verify their email before logging in.`)
      }

      setModalOpen(false)
      load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  // ─── Table columns ───────────────────────────────────────────────────────────
  const columns: TableColumn<Employee>[] = [
    {
      key: 'employee_code',
      header: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
            {row.profile?.full_name?.[0]?.toUpperCase() ?? 'E'}
          </div>
          <div>
            <p className="font-medium text-dark-900">{row.profile?.full_name ?? '—'}</p>
            <p className="text-xs text-dark-400">{row.employee_code}</p>
          </div>
        </div>
      ),
    },
    { key: 'designation', header: 'Designation', render: (_, row) => row.designation ?? '—' },
    { key: 'department', header: 'Department', render: (_, row) => row.department?.name ?? '—' },
    {
      key: 'employment_status',
      header: 'Status',
      render: (_, row) => (
        <Badge variant={statusVariant[row.employment_status]} size="sm">
          {row.employment_status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'joining_date',
      header: 'Joined',
      render: (_, row) => row.joining_date ? formatDateShort(row.joining_date) : '—',
    },
    { key: 'profile', header: 'Phone', render: (_, row) => row.profile?.phone ?? '—' },
    {
      key: 'id',
      header: '',
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); openEdit(row) }}
          className="p-1.5 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          aria-label="Edit employee"
        >
          <Edit className="w-4 h-4" />
        </button>
      ),
    },
  ]

  const deptOptions = [
    { value: '', label: '— No Department —' },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Employees</h1>
          <p className="text-dark-500 text-sm mt-0.5">{total} employees</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openNew}>
          Add Employee / Admin
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-dark-100 p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-44">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EmploymentStatus | '')}
            options={[
              { value: '', label: 'All Status' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'ON_LEAVE', label: 'On Leave' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'RESIGNED', label: 'Resigned' },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        keyExtractor={(row) => row.id}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={20}
        onPageChange={setPage}
        emptyTitle="No employees found"
        emptyDescription="Add your first employee to get started."
      />

      {/* ── Add / Edit Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Employee' : 'Add Employee / Admin'}
        size="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              leftIcon={<UserCheck className="w-4 h-4" />}
              onClick={handleSave}
              loading={saving}
            >
              {editTarget ? 'Save Changes' : 'Create Account'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Role selector — new only */}
          {!editTarget && (
            <div className="grid grid-cols-2 gap-3">
              {(['EMPLOYEE', 'ADMIN'] as RoleOption[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: r }))}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${
                    form.role === r
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-dark-200 hover:border-dark-300'
                  }`}
                >
                  <p className="font-bold text-dark-900 text-sm">
                    {r === 'ADMIN' ? '🛡 Admin' : '👤 Employee'}
                  </p>
                  <p className="text-xs text-dark-500 mt-1">
                    {r === 'ADMIN'
                      ? 'Full access to admin panel'
                      : 'Access to employee portal only'}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Personal info */}
          <div className="border-t border-dark-100 pt-4">
            <p className="text-xs font-semibold text-dark-500 uppercase tracking-wide mb-3">
              Personal Information
            </p>
            <div className="space-y-3">
              <Input
                label="Full Name"
                required
                value={form.full_name}
                onChange={set('full_name')}
                placeholder="e.g. Muhammad Ali"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Email Address"
                  type="email"
                  required={!editTarget}
                  value={form.email}
                  onChange={set('email')}
                  placeholder="employee@example.com"
                  disabled={!!editTarget}
                  hint={editTarget ? 'Email cannot be changed' : undefined}
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+92 300 000 0000"
                />
              </div>
              {!editTarget && (
                <Input
                  label="Password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 8 characters"
                  hint="Employee will use this to log in"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-dark-400 hover:text-dark-600"
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              )}
            </div>
          </div>

          {/* Employee record */}
          <div className="border-t border-dark-100 pt-4">
            <p className="text-xs font-semibold text-dark-500 uppercase tracking-wide mb-3">
              Employment Details
            </p>
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Employee Code"
                  required
                  value={form.employee_code}
                  onChange={set('employee_code')}
                  placeholder="e.g. EMP-001"
                  disabled={!!editTarget}
                  hint={editTarget ? 'Code cannot be changed' : undefined}
                />
                <Input
                  label="Designation"
                  value={form.designation}
                  onChange={set('designation')}
                  placeholder="e.g. Sales Executive"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Select
                  label="Department"
                  value={form.department_id}
                  onChange={set('department_id')}
                  options={deptOptions}
                />
                <Input
                  label="Joining Date"
                  type="date"
                  value={form.joining_date}
                  onChange={set('joining_date')}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Select
                  label="Employment Status"
                  value={form.employment_status}
                  onChange={set('employment_status')}
                  options={[
                    { value: 'ACTIVE',   label: 'Active' },
                    { value: 'ON_LEAVE', label: 'On Leave' },
                    { value: 'INACTIVE', label: 'Inactive' },
                    { value: 'RESIGNED', label: 'Resigned' },
                  ]}
                />
                <Input
                  label="Address"
                  value={form.address}
                  onChange={set('address')}
                  placeholder="City, Province"
                />
              </div>
            </div>
          </div>

          {/* Info note */}
          {!editTarget && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <X className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold">Email verification required</p>
                <p className="mt-0.5 text-amber-700">
                  The new user will receive a verification email. They must click the link
                  before they can log in. Make sure to check Supabase Auth settings if
                  you want to disable email confirmation.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
