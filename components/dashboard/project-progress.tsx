'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface Project {
  id: string
  name: string
  tasks: Array<{ status: string }>
}

export function ProjectProgress() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0
    const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-blue-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Project Progress</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Track the progress of your active projects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Project Progress</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Track the progress of your active projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No projects found. Create your first project to get started.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Project Progress</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">Track the progress of your active projects</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project) => {
          const progress = calculateProgress(project)
          return (
            <div key={project.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{project.name}</span>
                <span className="text-gray-600 dark:text-gray-300">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
