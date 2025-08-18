'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Task {
  id: string
  title: string
  project: { name: string }
  status: string
  dueDate: string | null
  createdAt: string
}

export function RecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRecentTasks()
  }, [])

  const fetchRecentTasks = async () => {
    try {
      setIsLoading(true)
      // Fetch user's assigned tasks (tasks in progress)
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      if (response.ok) {
        const user = await response.json()
        // Get the 5 most recent assigned tasks (in progress)
        const assignedTasks = user.assignedTasks || []
        const recentTasks = assignedTasks
          .sort((a: Task, b: Task) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5)
        setTasks(recentTasks)
      }
    } catch (error) {
      console.error('Failed to fetch recent tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'ON_HOLD':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
      case 'IN_PROGRESS':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
      case 'ON_HOLD':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Recent Tasks</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Your latest tasks and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div>
                    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                    <div className="w-20 h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mt-1" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div className="w-20 h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Recent Tasks</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Your latest tasks and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No tasks in progress. Start working on a task to see it here.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">My Assigned Tasks</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">Your tasks currently in progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center space-x-3">
                {getStatusIcon(task.status)}
                <div>
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white">{task.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{task.project.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className={getStatusColor(task.status)}>
                  {task.status.replace('_', ' ')}
                </Badge>
                {task.dueDate && (
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
