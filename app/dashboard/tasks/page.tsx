import { TaskViewSwitcher } from '@/components/tasks/task-view-switcher'

export default function TasksPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
        <p className="text-gray-600 dark:text-gray-300">Track and manage your assigned tasks</p>
      </div>

      <TaskViewSwitcher />
    </div>
  )
}
