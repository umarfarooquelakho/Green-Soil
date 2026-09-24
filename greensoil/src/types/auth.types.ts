import type { UserRole } from './database.types'

export interface AuthUser {
  id: string
  email: string
  profile: UserProfile | null
}

export interface UserProfile {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  role_id: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  full_name: string
  email: string
  password: string
  phone?: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface UpdatePasswordRequest {
  password: string
}

export interface UpdateProfileRequest {
  full_name?: string
  phone?: string
  avatar_url?: string
}
