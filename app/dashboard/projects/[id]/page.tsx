import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProjectHeader from '@/components/projects/project-header'
import ProjectTaskList from '@/components/projects/project-task-list'
import CreateTaskButton from '@/components/projects/create-task-button'

interface ProjectPageProps {
  params: { id: string }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      owner: true,
      tasks: {
        include: {
          assignee: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length
  const progress = project.tasks.length > 0 ? Math.round((completedTasks / project.tasks.length) * 100) : 0

  return (
    <div className="p-6 space-y-6">
      <ProjectHeader 
        project={project} 
        progress={progress}
        canEdit={true}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
        <CreateTaskButton projectId={project.id} />
      </div>

      <ProjectTaskList projectId={project.id} />
    </div>
  )
}
