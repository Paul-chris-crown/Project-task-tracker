'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Shield, FolderOpen, CheckSquare, Clock, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

interface UserStats {
  projectsOwned: number
  tasksCreated: number
  tasksAssigned: number
  tasksCompleted: number
  tasksInProgress: number
  tasksTodo: number
}

export function UserProfile() {
  const { user, isLoading } = useAuth()
  const [stats, setStats] = useState<UserStats>({
    projectsOwned: 0,
    tasksCreated: 0,
    tasksAssigned: 0,
    tasksCompleted: 0,
    tasksInProgress: 0,
    tasksTodo: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      
      // Safety check: ensure user exists and has an ID
      if (!user || !user.id) {
        console.log('User not loaded yet, skipping stats fetch')
        setStatsLoading(false)
        return
      }
      
      // Fetch projects and tasks to calculate statistics
      const [projectsResponse, tasksResponse] = await Promise.all([
        fetch('/api/projects', { credentials: 'include' }),
        fetch('/api/tasks', { credentials: 'include' })
      ])

      if (projectsResponse.ok && tasksResponse.ok) {
        const projects = await projectsResponse.json()
        const tasks = await tasksResponse.json()

        // Safety check: ensure we have valid data
        if (!Array.isArray(projects) || !Array.isArray(tasks)) {
          console.error('Invalid API response format')
          setStatsLoading(false)
          return
        }

        // Calculate statistics for the current user
        const userStats: UserStats = {
          projectsOwned: projects.filter((p: any) => p?.owner?.id === user.id).length,
          tasksCreated: tasks.filter((t: any) => t?.creator?.id === user.id).length,
          tasksAssigned: tasks.filter((t: any) => t?.creator?.id === user.id && t?.status === 'IN_PROGRESS').length,
          tasksCompleted: tasks.filter((t: any) => t?.creator?.id === user.id && t?.status === 'COMPLETED').length,
          tasksInProgress: tasks.filter((t: any) => t?.creator?.id === user.id && t?.status === 'IN_PROGRESS').length,
          tasksTodo: tasks.filter((t: any) => t?.creator?.id === user.id && t?.status === 'TODO').length
        }

        setStats(userStats)
      } else {
        console.error('Failed to fetch data:', { projectsResponse: projectsResponse.status, tasksResponse: tasksResponse.status })
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
      setError('Failed to load statistics. Please try again.')
    } finally {
      setStatsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchUserStats()
    }
  }, [user, fetchUserStats])

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-24"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {user.name || user.email}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              <Badge variant="secondary" className="mt-1">
                {user.role}
              </Badge>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Member since {new Date().toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-white">Account Statistics</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null)
                fetchUserStats()
              }}
              disabled={statsLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        {error && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}
        <CardContent>
          {statsLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-gray-400 dark:text-gray-500 animate-pulse">-</div>
                  <div className="text-sm text-gray-400 dark:text-gray-500">Loading...</div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {stats.projectsOwned === 0 && stats.tasksCreated === 0 && stats.tasksAssigned === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-500 mb-3 text-4xl">🚀</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Welcome to Task Tracker!</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You haven&apos;t created any projects or tasks yet.</p>
                  <div className="space-y-2 text-xs text-gray-400 dark:text-gray-500">
                    <p>• Create your first project to get started</p>
                    <p>• Add tasks to track your progress</p>
                    <p>• Your statistics will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.projectsOwned}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Projects Owned</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.tasksCreated}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Tasks Created</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.tasksAssigned}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Tasks Assigned</div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Detailed Task Statistics */}
          {!statsLoading && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Task Breakdown</h4>
              {stats.tasksAssigned > 0 ? (
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">{stats.tasksCompleted}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{stats.tasksInProgress}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">In Progress</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{stats.tasksTodo}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">To Do</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                      {Math.max(0, stats.tasksAssigned - stats.tasksCompleted - stats.tasksInProgress - stats.tasksTodo)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Other</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">📝</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No tasks assigned yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Create some tasks to see your statistics</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      {!statsLoading && (
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Projects</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.projectsOwned}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Ownership</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">100%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Task Creation</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.tasksCreated}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{stats.tasksCreated}</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Task Assignment</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.tasksAssigned}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Assigned</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{stats.tasksAssigned}</div>
                </div>
              </div>

              {stats.tasksAssigned > 0 && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {Math.round((stats.tasksCompleted / stats.tasksAssigned) * 100)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Completion Rate</div>
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {stats.tasksCompleted} / {stats.tasksAssigned}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Success</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {Math.round((stats.tasksCompleted / stats.tasksAssigned) * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Information */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Shield className="h-5 w-5" />
            <span>System Access</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Authentication Status</span>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Access Level</span>
              </div>
              <Badge variant="secondary">
                {user.role === 'ADMIN' ? 'Full Access' : 'Limited Access'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
