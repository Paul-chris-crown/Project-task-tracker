'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CreateTaskDialog from './create-task-dialog'

interface CreateTaskButtonProps {
  projectId: string
  currentUserEmail?: string
  currentUserRole?: string
  projectOwnerEmail?: string
}

export default function CreateTaskButton({ projectId, currentUserEmail, currentUserRole, projectOwnerEmail }: CreateTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Check if current user can create tasks in this project
  const canCreateTasks = currentUserRole === 'ADMIN' || currentUserEmail === projectOwnerEmail

  if (!canCreateTasks) {
    return null
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Task
      </Button>
      
      <CreateTaskDialog
        projectId={projectId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
