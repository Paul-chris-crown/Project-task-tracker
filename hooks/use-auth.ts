import { useState, useEffect } from 'react'

export interface UserInfo {
  id: string
  email: string
  role: string
  name: string
}

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else {
        setError('Failed to fetch user info')
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      setError('Failed to fetch user info')
    } finally {
      setIsLoading(false)
    }
  }

  const isAdmin = user?.role === 'ADMIN'
  const isMember = user?.role === 'MEMBER'
  const isAuthenticated = !!user

  const hasRole = (role: string) => user?.role === role
  const hasAnyRole = (roles: string[]) => user ? roles.includes(user.role) : false

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    user,
    isLoading,
    error,
    isAdmin,
    isMember,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    logout,
    refresh: fetchUserInfo
  }
}
