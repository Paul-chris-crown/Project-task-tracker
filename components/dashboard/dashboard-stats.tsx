'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Target, CheckCircle, Clock } from 'lucide-react'

interface DashboardStats {
  totalProjects: number
  totalTasks: number
  completedTasks: number
  overdueTasks: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      
      // Fetch projects and tasks to calculate stats
      const [projectsResponse, tasksResponse] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks')
      ])

      if (projectsResponse.ok && tasksResponse.ok) {
        const projects = await projectsResponse.json()
        const tasks = await tasksResponse.json()
        
        const completedTasks = tasks.filter((task: any) => task.status === 'COMPLETED').length
        const overdueTasks = tasks.filter((task: any) => {
          if (!task.dueDate || task.status === 'COMPLETED') return false
          return new Date() > new Date(task.dueDate)
        }).length

        setStats({
          totalProjects: projects.length,
          totalTasks: tasks.length,
          completedTasks,
          overdueTasks,
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statsData = [
    {
      title: 'Total Projects',
      value: stats.totalProjects.toString(),
      description: 'Active projects',
      icon: Target,
      color: 'text-blue-600',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks.toString(),
      description: 'Tasks across all projects',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Completed',
      value: stats.completedTasks.toString(),
      description: 'Tasks completed',
      icon: CheckCircle,
      color: 'text-emerald-600',
    },
    {
      title: 'Overdue',
      value: stats.overdueTasks.toString(),
      description: 'Tasks past due date',
      icon: Clock,
      color: 'text-red-600',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
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
