'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FolderOpen, Users, CheckCircle, Calendar, Edit } from 'lucide-react'
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

export function ProjectCalendarView() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
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

  const getMonthData = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const getProjectsForDate = (date: Date) => {
    return projects.filter(project => {
      const startDate = project.startDate ? new Date(project.startDate) : null
      const endDate = project.endDate ? new Date(project.endDate) : null
      
      // If no dates are set, don't show on calendar
      if (!startDate && !endDate) return false
      
      const dateStr = date.toDateString()
      
      // Check if date is within project timeline
      if (startDate && endDate) {
        // Project has both start and end dates - show on all days within range
        return date >= startDate && date <= endDate
      } else if (startDate) {
        // Project only has start date - show only on the start date
        return date.toDateString() === startDate.toDateString()
      } else if (endDate) {
        // Project only has end date - show only on the end date
        return date.toDateString() === endDate.toDateString()
      }
      
      return false
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700'
      case 'ACTIVE':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700'
      case 'ON_HOLD':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700'
      case 'PLANNING':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    const current = new Date(currentDate)
    return date.getMonth() === current.getMonth() && date.getFullYear() === current.getFullYear()
  }

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const calculateProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0
    const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Loading calendar...</div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="text-center py-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent>
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create your first project to see it on the calendar.
          </p>
        </CardContent>
      </Card>
    )
  }

  const monthDays = getMonthData(currentDate)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Calendar</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-xl text-gray-900 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
            
            {monthDays.map((date, index) => {
              const dayProjects = getProjectsForDate(date)
              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDate = isToday(date)
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-200 dark:border-gray-600 ${
                    isCurrentMonthDay ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                  } ${isTodayDate ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentMonthDay ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                  } ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayProjects.slice(0, 2).map(project => (
                      <div
                        key={project.id}
                        className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
                        title={`${project.name} - ${project.status}`}
                      >
                        <div className="font-medium truncate text-blue-800 dark:text-blue-200">{project.name}</div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(project.status)}`}
                        >
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                    
                    {dayProjects.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        +{dayProjects.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Project list for the month */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Projects This Month</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects
            .filter(project => {
              const startDate = project.startDate ? new Date(project.startDate) : null
              const endDate = project.endDate ? new Date(project.endDate) : null
              const current = new Date(currentDate)
              
              // Only show projects that are actually relevant to the current month
              if (startDate && endDate) {
                // Project has both dates - check if current month overlaps with project timeline
                const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
                const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
                return startDate <= monthEnd && endDate >= monthStart
              } else if (startDate) {
                // Project only has start date - show only if it starts in current month
                return startDate.getMonth() === current.getMonth() && startDate.getFullYear() === current.getFullYear()
              } else if (endDate) {
                // Project only has end date - show only if it ends in current month
                return endDate.getMonth() === current.getMonth() && endDate.getFullYear() === current.getFullYear()
              }
              return false
            })
            .map(project => {
              const progress = calculateProgress(project)
              const isOverdue = project.endDate && new Date() > new Date(project.endDate) && project.status !== 'COMPLETED'
              
              return (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">{project.name}</h4>
                      
                      {project.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{project.description}</p>
                      )}
                      
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
                          <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}`}>
                            <Calendar className="h-3 w-3" />
                            <span>Due: {new Date(project.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        
                        <div className="flex items-center space-x-2">
                          {canEditProject(project) && project.status !== 'COMPLETED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => updateProjectStatus(project.id, 'COMPLETED')}
                            >
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
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
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
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
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
