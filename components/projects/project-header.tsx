'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { EditProjectDialog } from './edit-project-dialog'
import { DeleteProjectDialog } from './delete-project-dialog'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  startDate: Date | null
  dueDate: Date | null
  owner: {
    id: string
    name: string
  }
}

interface ProjectHeaderProps {
  project: Project
  progress: number
  canEdit: boolean
}

export default function ProjectHeader({ project, progress, canEdit }: ProjectHeaderProps) {
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
      case 'COMPLETED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
      case 'ON_HOLD':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700'
      case 'CANCELLED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
    }
  }

  const isOverdue = project.dueDate && new Date() > project.dueDate && project.status !== 'COMPLETED'

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-2xl text-gray-900 dark:text-white">{project.name}</CardTitle>
              <Badge variant="secondary" className={getStatusColor(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-3">{project.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Owner: {project.owner.name}</span>
              {project.startDate && (
                <span>Started: {format(project.startDate, 'MMM dd, yyyy')}</span>
              )}
              {project.dueDate && (
                <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                  Due: {format(project.dueDate, 'MMM dd, yyyy')}
                </span>
              )}
            </div>
          </div>
          {canEdit && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditProject(project)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteProjectId(project.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>

      <EditProjectDialog
        project={editProject}
        onClose={() => setEditProject(null)}
      />

      <DeleteProjectDialog
        projectId={deleteProjectId}
        onClose={() => setDeleteProjectId(null)}
      />
    </Card>
  )
}
