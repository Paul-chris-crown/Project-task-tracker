'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { StatusFilter, StatusFilterOption } from '@/components/ui/status-filter'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  dueDate: string | null
  project: { id: string; name: string }
  creator?: { id: string; name: string }
  assignee?: { id: string; name: string }
}

const statusColumns = [
  { key: 'TODO', title: 'To Do', color: 'bg-gray-100', textColor: 'text-gray-800', icon: Clock },
  { key: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100', textColor: 'text-blue-800', icon: Clock },
  { key: 'ON_HOLD', title: 'On Hold', color: 'bg-yellow-100', textColor: 'text-yellow-800', icon: AlertTriangle },
  { key: 'COMPLETED', title: 'Completed', color: 'bg-green-100', textColor: 'text-green-800', icon: CheckCircle },
]

export function TaskBoardView() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const canEditTask = (task: Task) => {
    return user && (user.role === 'ADMIN' || task.creator?.id === user.id)
  }

  // Filter tasks based on selected status
  const filteredTasks = selectedStatus 
    ? tasks.filter(task => task.status === selectedStatus)
    : tasks

  // Create filter options with counts
  const filterOptions: StatusFilterOption[] = [
    {
      value: 'TODO',
      label: 'To Do',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
      count: tasks.filter(t => t.status === 'TODO').length
    },
    {
      value: 'IN_PROGRESS',
      label: 'In Progress',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      count: tasks.filter(t => t.status === 'IN_PROGRESS').length
    },
    {
      value: 'ON_HOLD',
      label: 'On Hold',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      count: tasks.filter(t => t.status === 'ON_HOLD').length
    },
    {
      value: 'COMPLETED',
      label: 'Completed',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      count: tasks.filter(t => t.status === 'COMPLETED').length
    }
  ]

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Task status updated successfully',
        })
        fetchTasks() // Refresh the list
      } else {
        throw new Error('Failed to update task')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== newStatus) {
      await updateTaskStatus(draggedTask.id, newStatus)
    }
    setDraggedTask(null)
  }

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Loading board...</div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className="text-center py-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent>
          <Clock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create your first task to see it on the board.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <StatusFilter
        options={filterOptions}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        title="Filter Tasks by Status"
        showCounts={true}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Board</h2>
        <Badge variant="secondary" className="text-sm">
          {filteredTasks.length} {selectedStatus ? 'filtered' : 'total'} tasks
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.key)
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
                  {columnTasks.length}
                </Badge>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {columnTasks.map((task) => {
                  const isOverdue = task.dueDate && new Date() > new Date(task.dueDate) && task.status !== 'COMPLETED'
                  
                  return (
                    <Card
                      key={task.id}
                      className={`hover:shadow-md transition-shadow cursor-move bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
                        draggedTask?.id === task.id ? 'opacity-50' : ''
                      } ${task.status === 'COMPLETED' ? 'task-completed' : ''}`}
                      draggable={canEditTask(task) || false}
                      onDragStart={(e) => handleDragStart(e, task)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm line-clamp-2 text-gray-900 dark:text-white">{task.title}</h4>
                          
                          {task.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{task.description}</p>
                          )}
                          
                          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <div className="font-medium">Project: {task.project.name}</div>
                            
                            {task.creator && (
                              <div className={`${task.creator.id === user?.id ? 'text-green-600 dark:text-green-400' : ''}`}>
                                {task.creator.id === user?.id ? '✨ You created this' : `Created by: ${task.creator.name}`}
                              </div>
                            )}
                            
                            {task.assignee && (
                              <div className={`${task.assignee.id === user?.id ? 'text-purple-600 dark:text-purple-400' : ''}`}>
                                {task.assignee.id === user?.id ? '🎯 Assigned to you' : `Assigned to: ${task.assignee.name}`}
                              </div>
                            )}
                            
                            {task.dueDate && (
                              <div className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          {canEditTask(task) && task.status !== 'COMPLETED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                          )}
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
    </div>
  )
}
