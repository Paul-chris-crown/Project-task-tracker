'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'
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

export function TaskList() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  const canEditTask = (task: Task) => {
    return user && (user.role === 'ADMIN' || task.creator?.id === user.id)
  }

  // Filter tasks based on selected status
  const filteredTasks = useMemo(() => {
    if (!selectedStatus) return tasks
    return tasks.filter(task => task.status === selectedStatus)
  }, [tasks, selectedStatus])

  // Create filter options with counts
  const filterOptions: StatusFilterOption[] = useMemo(() => [
    {
      value: 'TODO',
      label: 'To Do',
      color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600',
      count: tasks.filter(t => t.status === 'TODO').length
    },
    {
      value: 'IN_PROGRESS',
      label: 'In Progress',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
      count: tasks.filter(t => t.status === 'IN_PROGRESS').length
    },
    {
      value: 'COMPLETED',
      label: 'Completed',
      color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
      count: tasks.filter(t => t.status === 'COMPLETED').length
    },
    {
      value: 'ON_HOLD',
      label: 'On Hold',
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
      count: tasks.filter(t => t.status === 'ON_HOLD').length
    }
  ], [tasks])

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      setUpdatingTaskId(taskId)
      
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
    } finally {
      setUpdatingTaskId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">Loading tasks...</div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className="text-center py-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent>
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks assigned</h3>
          <p className="text-gray-500 dark:text-gray-400">
            You don&apos;t have any tasks assigned to you yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (filteredTasks.length === 0 && selectedStatus) {
    return (
      <div className="space-y-4">
        {/* Status Filter */}
        <StatusFilter
          options={filterOptions}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          title="Filter Tasks by Status"
          showCounts={true}
        />
        
        <Card className="text-center py-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent>
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks with status &quot;{filterOptions.find(opt => opt.value === selectedStatus)?.label}&quot;</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try selecting a different status or clear the filter
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <StatusFilter
        options={filterOptions}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        title="Filter Tasks by Status"
        showCounts={true}
      />

      {/* Tasks List */}
      {filteredTasks.map((task) => {
        const isOverdue = task.dueDate && new Date() > new Date(task.dueDate) && task.status !== 'COMPLETED'
        
        return (
          <Card 
            key={task.id} 
            className={`hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${task.status === 'COMPLETED' ? 'task-completed' : ''}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{task.title}</CardTitle>
                    <Badge variant="secondary" className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{task.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Project: {task.project.name}</span>
                    {task.creator && (
                      <span className={`font-medium ${task.creator.id === user?.id ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {task.creator.id === user?.id ? '✨ You created this' : `Created by: ${task.creator.name}`}
                      </span>
                    )}
                    {task.assignee && (
                      <span className={`font-medium ${task.assignee.id === user?.id ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {task.assignee.id === user?.id ? '🎯 Assigned to you' : `Assigned to: ${task.assignee.name}`}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {canEditTask(task) && (
                    <>
                      {task.status !== 'COMPLETED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                          disabled={updatingTaskId === task.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}
                      {task.status === 'TODO' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                          disabled={updatingTaskId === task.id}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
