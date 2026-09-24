import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { AuthUser, UserProfile } from '@/types/auth.types'
import type { UserRole } from '@/types/database.types'

interface AuthContextValue {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: string | null }>
  hasRole: (roles: UserRole | UserRole[]) => boolean
  isAdmin: boolean
  isEmployee: boolean
  isManagement: boolean
  isCustomer: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      phone,
      avatar_url,
      role_id,
      roles (
        name
      )
    `)
    .eq('id', userId)
    .single()

  if (error || !data) return null

  const roleData = data.roles as { name: UserRole } | null

  return {
    id: data.id,
    full_name: data.full_name,
    phone: data.phone,
    avatar_url: data.avatar_url,
    role_id: data.role_id,
    role: roleData?.name ?? 'CUSTOMER',
  }
}

function buildAuthUser(supabaseUser: User, profile: UserProfile | null): AuthUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    profile,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async (supabaseUser: User) => {
    const profile = await fetchProfile(supabaseUser.id)
    setUser(buildAuthUser(supabaseUser, profile))
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) {
        await loadUser(s.user)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s)
        if (s?.user) {
          await loadUser(s.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [loadUser])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    })
    if (error) return { error: error.message }
    if (!data.user) return { error: 'Registration failed. Please try again.' }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) return { error: error.message }
    return { error: null }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' }
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name ?? undefined,
        phone: data.phone ?? undefined,
        avatar_url: data.avatar_url ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) return { error: error.message }

    // Refresh user
    if (session?.user) await loadUser(session.user)
    return { error: null }
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    const userRole = user?.profile?.role
    if (!userRole) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(userRole)
  }

  const isAdmin = hasRole(['SUPER_ADMIN', 'ADMIN'])
  const isManagement = hasRole(['SUPER_ADMIN', 'DIRECTOR', 'CEO', 'ADMIN'])
  const isEmployee = hasRole(['SUPER_ADMIN', 'DIRECTOR', 'CEO', 'ADMIN', 'EMPLOYEE'])
  const isCustomer = hasRole('CUSTOMER')

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        hasRole,
        isAdmin,
        isEmployee,
        isManagement,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
