'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CreateProjectDialog from './create-project-dialog'

interface CreateProjectButtonProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export function CreateProjectButton({ isOpen, onOpen, onClose }: CreateProjectButtonProps) {

  return (
    <>
      <Button onClick={onOpen}>
        <Plus className="mr-2 h-4 w-4" />
        Create Project
      </Button>
      
      <CreateProjectDialog
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  )
}
