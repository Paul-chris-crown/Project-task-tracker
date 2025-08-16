'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Clock, AlertTriangle, FolderOpen, Users, Calendar, Edit } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  startDate: string | null
  endDate: string | null
  owner: { id: string; name: string }
  tasks: Array<{
    id: string
    status: string
  }>
}

const statusColumns = [
  { key: 'PLANNING', title: 'Planning', color: 'bg-gray-100', textColor: 'text-gray-800', icon: Clock },
  { key: 'ACTIVE', title: 'Active', color: 'bg-blue-100', textColor: 'text-blue-800', icon: FolderOpen },
  { key: 'ON_HOLD', title: 'On Hold', color: 'bg-yellow-100', textColor: 'text-yellow-800', icon: AlertTriangle },
  { key: 'COMPLETED', title: 'Completed', color: 'bg-green-100', textColor: 'text-green-800', icon: CheckCircle },
]

export function ProjectBoardView() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [draggedProject, setDraggedProject] = useState<Project | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

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

  const canEditProject = (project: Project) => {
    return user && (user.role === 'ADMIN' || project.owner.id === user.id)
  }

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Project status updated successfully',
        })
        fetchProjects()
      } else {
        throw new Error('Failed to update project')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update project status. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (draggedProject && draggedProject.status !== newStatus) {
      await updateProjectStatus(draggedProject.id, newStatus)
    }
    setDraggedProject(null)
  }

  const getProjectsByStatus = (status: string) => {
    return projects.filter(project => project.status === status)
  }

  const calculateProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0
    const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
  }

  const handleSaveEdit = async (formData: FormData) => {
    if (!editingProject) return

    try {
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          startDate: formData.get('startDate'),
          dueDate: formData.get('dueDate'),
          status: formData.get('status'),
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Project updated successfully',
        })
        setEditingProject(null)
        fetchProjects()
      } else {
        throw new Error('Failed to update project')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Loading board...</div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="text-center py-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent>
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create your first project to see it on the board.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Board</h2>
        <Badge variant="secondary" className="text-sm">
          {projects.length} total projects
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((column) => {
          const columnProjects = getProjectsByStatus(column.key)
          const IconComponent = column.icon

          return (
            <div
              key={column.key}
              className="space-y-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.key)}
            >
              <div className={`${column.color} ${column.textColor} rounded-lg p-3 flex items-center justify-between`}>
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-4 w-4" />
                  <span className="font-medium">{column.title}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {columnProjects.length}
                </Badge>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {columnProjects.map((project) => {
                  const progress = calculateProgress(project)
                  const isOverdue = project.endDate && new Date() > new Date(project.endDate) && project.status !== 'COMPLETED'
                  
                  return (
                    <Card
                      key={project.id}
                      className={`hover:shadow-md transition-shadow cursor-move bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                        draggedProject?.id === project.id ? 'opacity-50' : ''
                      }`}
                      draggable={canEditProject(project) || false}
                      onDragStart={(e) => handleDragStart(e, project)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm line-clamp-2 mb-1 text-gray-900 dark:text-white">{project.name}</h4>
                            {project.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{project.description}</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                          
                          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>Owner: {project.owner.name}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>{project.tasks.length} tasks</span>
                            </div>
                            
                            {project.startDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {project.endDate && (
                              <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                                <Calendar className="h-3 w-3" />
                                <span>Due: {new Date(project.endDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {canEditProject(project) && project.status !== 'COMPLETED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => updateProjectStatus(project.id, 'COMPLETED')}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                            )}
                            
                            {canEditProject(project) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => handleEditProject(project)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Project Dialog */}
      {editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Project</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleSaveEdit(new FormData(e.currentTarget))
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    name="name"
                    defaultValue={editingProject.name}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingProject.description || ''}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 h-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={editingProject.startDate ? editingProject.startDate.split('T')[0] : ''}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      defaultValue={editingProject.endDate ? editingProject.endDate.split('T')[0] : ''}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    name="status"
                    defaultValue={editingProject.status}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="PLANNING" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Planning</option>
                    <option value="ACTIVE" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Active</option>
                    <option value="ON_HOLD" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">On Hold</option>
                    <option value="COMPLETED" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingProject(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
