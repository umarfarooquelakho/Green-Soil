import { supabase } from '@/lib/supabase'
import type { EmploymentStatus } from '@/types/database.types'
import type { PaginatedResult } from '@/types/common.types'

export interface Employee {
  id: string
  profile_id: string
  employee_code: string
  department_id: string | null
  designation: string | null
  joining_date: string | null
  employment_status: EmploymentStatus
  address: string | null
  emergency_contact: Record<string, string> | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  profile?: {
    id: string
    full_name: string | null
    phone: string | null
    avatar_url: string | null
    email?: string
    role?: string
  }
  department?: {
    id: string
    name: string
  }
}

export interface Department {
  id: string
  name: string
  description: string | null
  created_at: string
}

const EMPLOYEE_SELECT = `
  id, profile_id, employee_code, department_id, designation,
  joining_date, employment_status, address, emergency_contact,
  created_at, updated_at, deleted_at,
  profiles (id, full_name, phone, avatar_url, roles(name)),
  departments (id, name)
`

export const employeeService = {
  async getEmployees(
    search = '',
    status?: EmploymentStatus,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResult<Employee>> {
    let query = supabase
      .from('employees')
      .select(EMPLOYEE_SELECT, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('employment_status', status)
    if (search) {
      query = query.ilike('employee_code', `%${search}%`)
    }

    query = query.range((page - 1) * pageSize, page * pageSize - 1)

    const { data, error, count } = await query
    if (error) throw new Error(error.message)

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: (data ?? []).map(mapEmployee) as any,
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    }
  },

  async getEmployeeById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select(EMPLOYEE_SELECT)
      .eq('id', id)
      .single()

    if (error || !data) return null
    return mapEmployee(data)
  },

  async createEmployee(input: {
    profile_id: string
    employee_code: string
    department_id?: string
    designation?: string
    joining_date?: string
    employment_status?: EmploymentStatus
    address?: string
    emergency_contact?: Record<string, string>
  }): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert({
        ...input,
        employment_status: input.employment_status ?? 'ACTIVE',
      })
      .select(EMPLOYEE_SELECT)
      .single()

    if (error) throw new Error(error.message)
    return mapEmployee(data)
  },

  async updateEmployee(
    id: string,
    input: Partial<{
      department_id: string
      designation: string
      joining_date: string
      employment_status: EmploymentStatus
      address: string
      emergency_contact: Record<string, string>
    }>
  ): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(EMPLOYEE_SELECT)
      .single()

    if (error) throw new Error(error.message)
    return mapEmployee(data)
  },

  async archiveEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({
        deleted_at: new Date().toISOString(),
        employment_status: 'RESIGNED',
      })
      .eq('id', id)

    if (error) throw new Error(error.message)
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true })

    if (error) return []
    return data ?? []
  },

  async createDepartment(name: string, description?: string): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .insert({ name, description })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async getEmployeeStats() {
    const { data } = await supabase
      .from('employees')
      .select('employment_status')
      .is('deleted_at', null)

    return {
      total: data?.length ?? 0,
      active: data?.filter((e) => e.employment_status === 'ACTIVE').length ?? 0,
      onLeave: data?.filter((e) => e.employment_status === 'ON_LEAVE').length ?? 0,
      inactive: data?.filter((e) => e.employment_status === 'INACTIVE').length ?? 0,
    }
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEmployee(data: any): Employee {
  const profile = data.profiles
  const roles = profile?.roles
  return {
    ...data,
    profile: profile
      ? {
          id: profile.id,
          full_name: profile.full_name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          role: Array.isArray(roles) ? roles[0]?.name : roles?.name,
        }
      : null,
    department: data.departments ?? null,
  }
}
