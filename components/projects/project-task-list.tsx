'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Edit, Trash2, Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import CreateTaskDialog from './create-task-dialog'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  dueDate: string | null
}

interface ProjectTaskListProps {
  projectId: string
}

export default function ProjectTaskList({ projectId }: ProjectTaskListProps) {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks?projectId=${projectId}`, {
        credentials: 'include' // Include cookies in the request
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchTasks()
  }, [projectId, fetchTasks])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'ON_HOLD':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'To Do'
      case 'IN_PROGRESS':
        return 'In Progress'
      case 'COMPLETED':
        return 'Completed'
      case 'ON_HOLD':
        return 'On Hold'
      default:
        return status
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
          const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies in the request
      body: JSON.stringify({ status: newStatus }),
    })

      if (response.ok) {
        toast({ title: 'Success', description: 'Task status updated' })
        fetchTasks()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update task', variant: 'destructive' })
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { 
      method: 'DELETE',
      credentials: 'include' // Include cookies in the request
    })
      if (response.ok) {
        toast({ title: 'Success', description: 'Task deleted' })
        fetchTasks()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete task', variant: 'destructive' })
    }
  }

  const handleTaskCreated = () => {
    setIsCreateDialogOpen(false)
    fetchTasks()
  }

  const handleTaskUpdated = () => {
    setEditingTask(null)
    fetchTasks()
  }

  if (isLoading) {
    return <div className="text-center py-4 text-gray-600 dark:text-gray-300">Loading tasks...</div>
  }

  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length
  const onHoldTasks = tasks.filter(task => task.status === 'ON_HOLD').length
  const todoTasks = tasks.filter(task => task.status === 'TODO').length
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Task Summary */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Task Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tasks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inProgressTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{onHoldTasks}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">On Hold</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-900 dark:text-white">Progress</span>
              <span className="text-gray-900 dark:text-white">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No tasks yet. Create your first task to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className={`hover:shadow-sm transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${task.status === 'COMPLETED' ? 'task-completed' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusText(task.status)}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{task.description}</p>
                    )}
                    
                    {task.dueDate && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="TODO" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">To Do</option>
                      <option value="IN_PROGRESS" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">In Progress</option>
                      <option value="COMPLETED" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Completed</option>
                      <option value="ON_HOLD" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">On Hold</option>
                    </select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTask(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTaskDialog
        projectId={projectId}
        isOpen={isCreateDialogOpen}
        onClose={handleTaskCreated}
      />

      {/* Edit Task Dialog - Simple inline editing for now */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Task</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const title = formData.get('title') as string
              const description = formData.get('description') as string
              
              fetch(`/api/tasks/${editingTask.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description }),
              }).then(() => handleTaskUpdated())
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
                  <input
                    name="title"
                    defaultValue={editingTask.title}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingTask.description || ''}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Update</Button>
                  <Button type="button" variant="outline" onClick={() => setEditingTask(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
