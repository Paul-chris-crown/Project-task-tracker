'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import ProjectHeader from '@/components/projects/project-header'
import ProjectTaskList from '@/components/projects/project-task-list'
import CreateTaskButton from '@/components/projects/create-task-button'

interface ProjectPageProps {
  params: { id: string }
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  startDate: string | null
  dueDate: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string
    email: string
    role: string
  }
  tasks: Array<{
    id: string
    title: string
    description: string | null
    status: string
    dueDate: string | null
    assigneeId: string | null
    createdById: string
    createdAt: string
    updatedAt: string
    assignee: {
      id: string
      name: string
      email: string
      role: string
    } | null
  }>
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project and user info in parallel
        const [projectResponse, userResponse] = await Promise.all([
          fetch(`/api/projects/${params.id}`),
          fetch('/api/auth/me', { credentials: 'include' })
        ])

        if (projectResponse.ok) {
          const projectData = await projectResponse.json()
          setProject(projectData)
        } else if (projectResponse.status === 404) {
          notFound()
        } else {
          setError('Failed to fetch project')
        }

        if (userResponse.ok) {
          const userData = await userResponse.json()
          setCurrentUser(userData)
        }
      } catch (err) {
        setError('Failed to fetch project')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="text-red-600">Error: {error || 'Project not found'}</div>
      </div>
    )
  }

  const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length
  const progress = project.tasks.length > 0 ? Math.round((completedTasks / project.tasks.length) * 100) : 0

  // Convert string dates to Date objects for ProjectHeader component
  const projectForHeader = {
    ...project,
    startDate: project.startDate ? new Date(project.startDate) : null,
    dueDate: project.dueDate ? new Date(project.dueDate) : null
  }

  return (
    <div className="p-6 space-y-6">
      <ProjectHeader 
        project={projectForHeader} 
        progress={progress}
        canEdit={true}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
        <CreateTaskButton 
          projectId={project.id} 
          currentUserEmail={currentUser?.email}
          currentUserRole={currentUser?.role}
          projectOwnerEmail={project.owner.email}
        />
      </div>

      <ProjectTaskList 
        projectId={project.id} 
        currentUserEmail={currentUser?.email}
        currentUserRole={currentUser?.role}
      />
    </div>
  )
}
