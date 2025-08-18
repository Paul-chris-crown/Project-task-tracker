'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Shield, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AllowedUser {
  email: string
  role: string
}

export default function AllowedUsersPage() {
  const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([])
  const [newUser, setNewUser] = useState({ email: '', role: 'MEMBER' })
  const [loading, setLoading] = useState(true)
  const [addingUser, setAddingUser] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAllowedUsers()
  }, [])

  const fetchAllowedUsers = async () => {
    try {
      const response = await fetch('/api/admin/allowed-users', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAllowedUsers(data)
      } else {
        console.error('Failed to fetch allowed users')
        toast({
          title: 'Error',
          description: 'Failed to fetch allowed users',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching allowed users:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch allowed users',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const addAllowedUser = async () => {
    if (!newUser.email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email',
        variant: 'destructive',
      })
      return
    }

    if (!newUser.role) {
      toast({
        title: 'Error',
        description: 'Please select a role',
        variant: 'destructive',
      })
      return
    }

    setAddingUser(true)
    try {
      const response = await fetch('/api/admin/allowed-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success',
          description: `User ${newUser.email} added successfully`,
        })
        setNewUser({ email: '', role: 'MEMBER' })
        fetchAllowedUsers() // Refresh the list
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to add user',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding allowed user:', error)
      toast({
        title: 'Error',
        description: 'Failed to add user',
        variant: 'destructive',
      })
    } finally {
      setAddingUser(false)
    }
  }

  const removeAllowedUser = async (email: string) => {
    if (!confirm(`Are you sure you want to remove ${email}? This will also delete their account and all associated data.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/allowed-users?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `User ${email} removed successfully`,
        })
        fetchAllowedUsers() // Refresh the list
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to remove user',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error removing allowed user:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove user',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading allowed users...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Allowed Users</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Control who can access the Task Tracker application
        </p>
      </div>

      {/* Add New User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Allowed User
          </CardTitle>
          <CardDescription>
            Add new users who can access the application. They will be able to log in with the admin password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@example.com"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:text-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Member
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={addAllowedUser} 
            disabled={addingUser || !newUser.email.trim()}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {addingUser ? 'Adding...' : 'Add User'}
          </Button>
        </CardContent>
      </Card>

      {/* Current Allowed Users */}
      <Card>
        <CardHeader>
          <CardTitle>Current Allowed Users</CardTitle>
          <CardDescription>
            {allowedUsers.length} user{allowedUsers.length !== 1 ? 's' : ''} can access the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allowedUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No allowed users configured. Add users above to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {allowedUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{user.email}</div>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role === 'ADMIN' ? (
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Member
                          </div>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAllowedUser(user.email)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800 dark:text-blue-200">
          <ul className="space-y-2 text-sm">
            <li>• <strong>Allowed Users:</strong> Only emails in this list can log into the application</li>
            <li>• <strong>Admin Password:</strong> All users use the same admin password to log in</li>
            <li>• <strong>Role Assignment:</strong> Users get their assigned role (Admin or Member) when they first log in</li>
            <li>• <strong>Security:</strong> Unauthorized emails will be blocked even with the correct password</li>
            <li>• <strong>Database Sync:</strong> Users are automatically created in the database when they first log in</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
