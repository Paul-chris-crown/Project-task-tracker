import { OrganizationStats } from '@/components/stats/admin-stats'
import { ProjectCharts } from '@/components/stats/admin-charts'
import { TeamStats } from '@/components/stats/user-stats'

export default function StatsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stats Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Organization overview and analytics</p>
      </div>

      <OrganizationStats />
      <ProjectCharts />
      <TeamStats />
    </div>
  )
}
