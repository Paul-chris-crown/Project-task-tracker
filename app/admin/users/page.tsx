'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Users, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AllowedUser {
  id: string
  email: string
  role: string
  createdAt: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<AllowedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'MEMBER' })
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchUsers()
    fetchCurrentUser()
  }, [fetchUsers])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error)
    }
  }

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name',
        variant: 'destructive',
      })
      return
    }
    if (!newUser.email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsAdding(true)
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User added successfully',
        })
        setNewUser({ name: '', email: '', role: 'MEMBER' })
        fetchUsers()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add user')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add user',
        variant: 'destructive',
      })
    } finally {
      setIsAdding(false)
    }
  }

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `User role updated to ${newRole}`,
        })
        fetchUsers() // Refresh the list
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to update user role',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      })
    }
  }

  const removeUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user? They will no longer be able to access the application.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'User removed successfully',
        })
        fetchUsers()
      } else {
        throw new Error('Failed to remove user')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove user',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-300">Control access to the Task Tracker application by managing user accounts</p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            💡 <strong>Note:</strong> Only users added here can log in to the system. Make sure to add at least one admin user first.
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            ⚠️ <strong>Security:</strong> Admins cannot edit their own roles. Primary admin is protected from accidental role changes.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Add New User */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Plus className="h-5 w-5" />
              <span>Add New User</span>
            </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
            Add new users who will be able to access the Task Tracker application
          </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="User Name"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:text-gray-400"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@example.com"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add User'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Users className="h-5 w-5" />
              <span>System Users ({users.length})</span>
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Users who have access to the Task Tracker application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No users found. Add the first user above.
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                          {user.email === 'adeofdefi@gmail.com' && user.role === 'ADMIN' && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700">
                              Primary Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Added {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.email === currentUser?.email || user.email === 'adeofdefi@gmail.com' ? (
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {user.role}
                          </Badge>
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            {user.email === currentUser?.email ? '(You - cannot edit)' : '(Primary Admin - protected)'}
                          </span>
                        </div>
                      ) : (
                        <Select
                          value={user.role}
                          onValueChange={(newRole) => changeUserRole(user.id, newRole)}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      
                      {user.email === currentUser?.email || user.email === 'adeofdefi@gmail.com' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          title={user.email === currentUser?.email ? "Cannot delete your own account" : "Cannot delete the primary admin account"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeUser(user.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
