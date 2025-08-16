'use client'

import { useState } from 'react'
import { ProjectViewSwitcher } from '@/components/projects/project-view-switcher'
import { CreateProjectButton } from '@/components/projects/create-project-button'

export default function ProjectsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your projects and track progress</p>
        </div>
        <CreateProjectButton 
          isOpen={isCreateDialogOpen}
          onOpen={() => setIsCreateDialogOpen(true)}
          onClose={() => setIsCreateDialogOpen(false)}
        />
      </div>

      <ProjectViewSwitcher />
    </div>
  )
}
