'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, Database } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function DataExport() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const exportData = async (format: 'json' | 'csv') => {
    try {
      setIsExporting(true)
      
      // Fetch all data
      const [projectsResponse, tasksResponse, userResponse] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks'),
        fetch('/api/users')
      ])

      if (!projectsResponse.ok || !tasksResponse.ok || !userResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const projects = await projectsResponse.json()
      const tasks = await tasksResponse.json()
      const user = await userResponse.json()

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          name: user.name,
          email: user.email,
          role: user.role
        },
        projects,
        tasks,
        summary: {
          totalProjects: projects.length,
          totalTasks: tasks.length,
          completedTasks: tasks.filter((t: any) => t.status === 'COMPLETED').length,
          activeProjects: projects.filter((p: any) => p.status === 'ACTIVE').length
        }
      }

      if (format === 'json') {
        // Export as JSON
        const dataStr = JSON.stringify(exportData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `task-tracker-export-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
      } else {
        // Export as CSV
        const csvContent = generateCSV(exportData)
        const dataBlob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `task-tracker-export-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
      }

      toast({
        title: 'Success',
        description: `Data exported successfully as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: 'Error',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const generateCSV = (data: any) => {
    let csv = 'Project Name,Project Status,Project Description,Task Title,Task Status,Task Description,Task Due Date\n'
    
    data.projects.forEach((project: any) => {
      if (project.tasks && project.tasks.length > 0) {
        project.tasks.forEach((task: any) => {
          csv += `"${project.name}","${project.status}","${project.description || ''}","${task.title}","${task.status}","${task.description || ''}","${task.dueDate || ''}"\n`
        })
      } else {
        csv += `"${project.name}","${project.status}","${project.description || ''}","","","",""\n`
      }
    })
    
    return csv
  }

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Download className="h-5 w-5" />
            <span>Data Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Export your projects and tasks data in various formats for backup or analysis purposes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => exportData('json')}
              disabled={isExporting}
              variant="outline"
              className="h-auto p-4 flex-col space-y-2"
            >
              <FileText className="h-6 w-6" />
              <span>Export as JSON</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Full data with structure</span>
            </Button>
            
            <Button
              onClick={() => exportData('csv')}
              disabled={isExporting}
              variant="outline"
              className="h-auto p-4 flex-col space-y-2"
            >
              <Database className="h-6 w-6" />
              <span>Export as CSV</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Spreadsheet format</span>
            </Button>
          </div>

          {isExporting && (
            <div className="text-center py-4">
              <div className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                <span>Preparing export...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
