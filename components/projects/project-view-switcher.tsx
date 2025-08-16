'use client'

import { useState, useEffect } from 'react'
import { ProjectList } from './project-list'
import { ProjectBoardView } from './project-board-view'
import { ProjectCalendarView } from './project-calendar-view'
import { Button } from '@/components/ui/button'
import { List, Layout, Calendar } from 'lucide-react'

type ViewType = 'list' | 'board' | 'calendar'

interface ProjectViewSwitcherProps {
  defaultView?: ViewType
}

export function ProjectViewSwitcher({ defaultView = 'list' }: ProjectViewSwitcherProps) {
  const [currentView, setCurrentView] = useState<ViewType>(defaultView)

  // Load user's default view preference
  useEffect(() => {
    const loadDefaultView = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const userData = await response.json()
          if (userData.preferences) {
            try {
              const parsedPreferences = JSON.parse(userData.preferences)
              if (parsedPreferences.display?.defaultView) {
                setCurrentView(parsedPreferences.display.defaultView)
              }
            } catch (parseError) {
              console.error('Failed to parse preferences:', parseError)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error)
      }
    }

    loadDefaultView()
  }, [])

  const views = [
    { key: 'list', label: 'List View', icon: List },
    { key: 'board', label: 'Board View', icon: Layout },
    { key: 'calendar', label: 'Calendar View', icon: Calendar },
  ]

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return <ProjectList />
      case 'board':
        return <ProjectBoardView />
      case 'calendar':
        return <ProjectCalendarView />
      default:
        return <ProjectList />
    }
  }

  return (
    <div className="space-y-6">
      {/* View Switcher */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
        <div className="flex items-center space-x-2">
          {views.map((view) => {
            const IconComponent = view.icon
            return (
              <Button
                key={view.key}
                variant={currentView === view.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView(view.key as ViewType)}
                className="flex items-center space-x-2"
              >
                <IconComponent className="h-4 w-4" />
                <span>{view.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Current View */}
      {renderView()}
    </div>
  )
}
