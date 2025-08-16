import { cookies } from 'next/headers'

export interface UserInfo {
  email: string
  role: string
}

/**
 * Get current user information from cookies
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
  try {
    const cookieStore = cookies()
    
    const adminAuthCookie = cookieStore.get('admin_auth')
    const userEmail = cookieStore.get('user_email')
    const userRole = cookieStore.get('user_role')
    
    if (!adminAuthCookie || adminAuthCookie.value !== 'true' || !userEmail || !userRole) {
      return null
    }
    
    return {
      email: userEmail.value,
      role: userRole.value
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'ADMIN'
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === role
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(roles: string[]): Promise<boolean> {
  const user = await getCurrentUser()
  return user ? roles.includes(user.role) : false
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<UserInfo> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin(): Promise<UserInfo> {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return user
}
