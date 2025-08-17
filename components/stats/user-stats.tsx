'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, FolderOpen, CheckSquare, Clock, Users } from 'lucide-react'

interface UserStats {
  id: string
  name: string
  email: string
  role: string
  projectCount: number
  taskCount: number
  assignedTaskCount: number
  ownedProjects: Array<{
    id: string
    name: string
    status: string
    createdAt: string
  }>
  createdTasks: Array<{
    id: string
    title: string
    status: string
    project: {
      id: string
      name: string
    }
    createdAt: string
  }>
  assignedTasks: Array<{
    id: string
    title: string
    status: string
    project: {
      id: string
      name: string
    }
    createdAt: string
  }>
}

export function TeamStats() {
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/team/stats', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Team stats response:', data)
        console.log('Users data type:', typeof data.users, 'Is array:', Array.isArray(data.users))
        
        if (data && data.users && Array.isArray(data.users)) {
          // Validate each user object has required properties
          const validUsers = data.users.filter((user: any) => 
            user && 
            typeof user === 'object' && 
            user.id && 
            user.name && 
            user.email && 
            user.role &&
            typeof user.projectCount === 'number' &&
            typeof user.taskCount === 'number' &&
            typeof user.assignedTaskCount === 'number'
          )
          
          console.log('Valid users count:', validUsers.length)
          setUserStats(validUsers)
        } else {
          console.error('Invalid users data:', data.users)
          setUserStats([])
        }
      } else {
        console.error('Failed to fetch user stats:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'TODO':
        return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return <div className="text-center py-8">Loading user statistics...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Team Statistics</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userStats.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{user.name}</CardTitle>
                </div>
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                {user.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {user.projectCount}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {user.taskCount}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {user.assignedTaskCount}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Assigned</div>
                </div>
              </div>

              <Tabs defaultValue="projects" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="projects" className="text-xs">
                    <FolderOpen className="h-3 w-3 mr-1" />
                    Projects
                  </TabsTrigger>
                  <TabsTrigger value="created" className="text-xs">
                    <CheckSquare className="h-3 w-3 mr-1" />
                    Created
                  </TabsTrigger>
                  <TabsTrigger value="assigned" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Assigned
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="projects" className="mt-3">
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {user.ownedProjects && user.ownedProjects.length > 0 ? (
                      user.ownedProjects.map((project: any) => (
                        <div key={project.id} className="flex items-center justify-between text-sm text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="truncate font-medium">{project.name}</span>
                              <Badge className={`text-xs ml-2 ${getStatusColor(project.status)}`}>
                                {project.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {project.taskCount} task{project.taskCount !== 1 ? 's' : ''} • {project.completedTaskCount} completed
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                        No projects owned
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="created" className="mt-3">
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {user.createdTasks && user.createdTasks.length > 0 ? (
                      user.createdTasks.map((task: any) => (
                        <div key={task.id} className="text-sm text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center justify-between">
                            <span className="truncate font-medium">{task.title}</span>
                            <Badge className={`text-xs ml-2 ${getStatusColor(task.status)}`}>
                              {task.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            in {task.projectName}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                        No tasks created
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="assigned" className="mt-3">
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {user.assignedTasks && user.assignedTasks.length > 0 ? (
                      user.assignedTasks.map((task: any) => (
                        <div key={task.id} className="text-sm text-gray-900 dark:text-white p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center justify-between">
                            <span className="truncate font-medium">{task.title}</span>
                            <Badge className={`text-xs ml-2 ${getStatusColor(task.status)}`}>
                              {task.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            in {task.projectName}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                        No tasks assigned
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
