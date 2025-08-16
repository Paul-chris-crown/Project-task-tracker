'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CreateTaskDialog from './create-task-dialog'

interface CreateTaskButtonProps {
  projectId: string
}

export default function CreateTaskButton({ projectId }: CreateTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

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
