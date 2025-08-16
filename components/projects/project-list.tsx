'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Edit, Trash2, Plus, FolderOpen } from 'lucide-react'
import { DeleteProjectDialog } from './delete-project-dialog'
import { EditProjectDialog } from './edit-project-dialog'
import { useAuth } from '@/hooks/use-auth'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  startDate: Date | null
  dueDate: Date | null
  owner: { id: string; name: string }
  tasks: Array<{ id: string; status: string }>
}

interface ProjectListProps {}

export function ProjectList({}: ProjectListProps) {
  const { user } = useAuth()
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)
  const [editProject, setEditProject] = useState<Project | null>(null)
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
    const completedTasks = project.tasks.filter((task) => task.status === 'COMPLETED').length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active'
      case 'COMPLETED':
        return 'Completed'
      case 'ON_HOLD':
        return 'On Hold'
      case 'CANCELLED':
        return 'Cancelled'
      default:
        return status
    }
  }

  const handleProjectDeleted = () => {
    setDeleteProjectId(null)
    fetchProjects() // Refresh the list
  }

  const handleProjectUpdated = () => {
    setEditProject(null)
    fetchProjects() // Refresh the list
  }

  const canEditProject = (project: Project) => {
    return user && (user.role === 'ADMIN' || project.owner.id === user.id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Loading projects...</div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400 mb-4">No projects yet</div>
        <p className="text-sm text-gray-400 dark:text-gray-500">Create your first project to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {project.name}
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                  {project.description || 'No description provided'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span className={`font-medium ${project.owner.id === user?.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {project.owner.id === user?.id ? '👑 You own this project' : `Owner: ${project.owner.name}`}
                  </span>
                  {project.startDate && (
                    <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                  )}
                  {project.dueDate && (
                    <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusText(project.status)}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {project.tasks.length} tasks
                  </span>
                </div>

                {project.tasks.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Progress</span>
                      <span className="text-gray-500 dark:text-gray-400">{calculateProgress(project)}%</span>
                    </div>
                    <Progress value={calculateProgress(project)} className="h-2" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                {canEditProject(project) && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditProject(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteProjectId(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Link href={`/dashboard/projects/${project.id}`}>
                  <Button variant="outline" size="sm">
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}

      <DeleteProjectDialog
        projectId={deleteProjectId}
        onClose={handleProjectDeleted}
      />

      <EditProjectDialog
        project={editProject}
        onClose={handleProjectUpdated}
      />
    </div>
  )
}
