'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FolderOpen, CheckSquare, Clock, TrendingUp } from 'lucide-react'
import { safeNumber, safeString } from '@/lib/utils'

interface AdminStats {
  totalProjects: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  totalUsers: number
  activeUsers: number
  completionRate: number
}

export function OrganizationStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    totalUsers: 0,
    activeUsers: 0,
    completionRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all data to calculate stats
      const [projectsResponse, tasksResponse, teamStatsResponse] = await Promise.all([
        fetch('/api/projects', { credentials: 'include' }),
        fetch('/api/tasks', { credentials: 'include' }),
        fetch('/api/team/stats', { credentials: 'include' }) // Use the team stats endpoint
      ])

      if (projectsResponse.ok && tasksResponse.ok && teamStatsResponse.ok) {
        const projects = await projectsResponse.json()
        const tasks = await tasksResponse.json()
        const teamStats = await teamStatsResponse.json()
        
        const completedTasks = safeNumber(tasks.filter((task: any) => task.status === 'COMPLETED').length)
        const overdueTasks = safeNumber(tasks.filter((task: any) => {
          if (!task.dueDate || task.status === 'COMPLETED') return false
          return new Date() > new Date(task.dueDate)
        }).length)
        
        const completionRate = safeNumber(tasks.length) > 0 ? Math.round((completedTasks / safeNumber(tasks.length)) * 100) : 0

        setStats({
          totalProjects: safeNumber(projects.length),
          totalTasks: safeNumber(tasks.length),
          completedTasks,
          overdueTasks,
          totalUsers: safeNumber(teamStats.users?.length || 0),
          activeUsers: safeNumber(teamStats.users?.length || 0),
          completionRate,
        })
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error)
      // Set default values on error
      setStats({
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        totalUsers: 0,
        activeUsers: 0,
        completionRate: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const statsData = [
    {
      title: 'Total Projects',
      value: safeString(stats.totalProjects),
      description: 'Active projects',
      icon: FolderOpen,
      color: 'text-blue-600',
    },
    {
      title: 'Total Tasks',
      value: safeString(stats.totalTasks),
      description: 'Tasks across all projects',
      icon: CheckSquare,
      color: 'text-green-600',
    },
    {
      title: 'Completed Tasks',
      value: safeString(stats.completedTasks),
      description: 'Tasks completed',
      icon: CheckSquare,
      color: 'text-emerald-600',
    },
    {
      title: 'Overdue Tasks',
      value: safeString(stats.overdueTasks),
      description: 'Tasks past due date',
      icon: Clock,
      color: 'text-red-600',
    },
    {
      title: 'Total Users',
      value: safeString(stats.totalUsers),
      description: 'Registered users',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Active Users',
      value: safeString(stats.activeUsers),
      description: 'Users with activity',
      icon: Users,
      color: 'text-indigo-600',
    },
    {
      title: 'Completion Rate',
      value: `${safeString(stats.completionRate)}%`,
      description: 'Overall task completion',
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
