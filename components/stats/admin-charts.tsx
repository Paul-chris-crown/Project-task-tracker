'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function ProjectCharts() {
  const [tasksByStatus, setTasksByStatus] = useState<Array<{ status: string; count: number }>>([])
  const [recentProjects, setRecentProjects] = useState<Array<{ name: string; tasks: number; completed: number }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      setIsLoading(true)
      const [tasksResponse, projectsResponse] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/projects')
      ])

      if (tasksResponse.ok && projectsResponse.ok) {
        const tasks = await tasksResponse.json()
        const projects = await projectsResponse.json()

        // Calculate tasks by status
        const statusCounts = tasks.reduce((acc: any, task: any) => {
          acc[task.status] = (acc[task.status] || 0) + 1
          return acc
        }, {})
        
        const tasksByStatusData = Object.entries(statusCounts).map(([status, count]) => ({
          status: status.replace('_', ' '),
          count: count as number
        }))

        // Calculate project progress
        const projectsData = projects.slice(0, 5).map((project: any) => ({
          name: project.name,
          tasks: project.tasks.length,
          completed: project.tasks.filter((task: any) => task.status === 'COMPLETED').length
        }))

        setTasksByStatus(tasksByStatusData)
        setRecentProjects(projectsData)
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Loading...</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">Loading chart data...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tasksByStatus.length === 0 && recentProjects.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">No Data Available</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Create some projects and tasks to see charts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              No data to display yet
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tasks by Status Chart */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Tasks by Status</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Distribution of tasks across different statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tasksByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {tasksByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Projects Chart */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Recent Projects Progress</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">Task completion for recent projects</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recentProjects}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="tasks" fill="#3b82f6" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
