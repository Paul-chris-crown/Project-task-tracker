import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { ProjectProgress } from '@/components/dashboard/project-progress'
import { RecentTasks } from '@/components/dashboard/recent-tasks'

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Welcome to your project management dashboard</p>
      </div>

      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <ProjectProgress />
        <RecentTasks />
      </div>
    </div>
  )
}
