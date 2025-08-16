'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell, Eye, Palette, Globe, Save, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/components/theme-provider'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'es' | 'fr'
  notifications: {
    email: boolean
    push: boolean
    taskUpdates: boolean
    projectUpdates: boolean
    weeklyReports: boolean
  }
  display: {
    compactMode: boolean
    showCompletedTasks: boolean
    defaultView: 'list' | 'board' | 'calendar'
  }
}

export function UserPreferences() {
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const { theme: currentTheme, setTheme: setCurrentTheme } = useTheme()
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'en',
    notifications: {
      email: true,
      push: false,
      taskUpdates: true,
      projectUpdates: true,
      weeklyReports: false,
    },
    display: {
      compactMode: false,
      showCompletedTasks: true,
      defaultView: 'list',
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadPreferences = useCallback(async () => {
    if (!user) return
    
    try {
      setError(null)
      const response = await fetch('/api/users')
      if (response.ok) {
        const userData = await response.json()
        if (userData.preferences) {
          try {
            const parsedPreferences = JSON.parse(userData.preferences)
            setPreferences(prev => ({ ...prev, ...parsedPreferences }))
            // Apply theme immediately when loading preferences
            if (parsedPreferences.theme) {
              setCurrentTheme(parsedPreferences.theme)
            }
          } catch (parseError) {
            console.error('Failed to parse preferences:', parseError)
            setError('Failed to load saved preferences. Using defaults.')
          }
        }
      } else {
        setError('Failed to load user preferences')
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
      setError('Failed to load preferences. Please try again.')
    }
  }, [user, setCurrentTheme])

  useEffect(() => {
    if (user && !authLoading) {
      loadPreferences()
    }
  }, [user, authLoading, loadPreferences])

  // Apply theme changes immediately
  useEffect(() => {
    if (preferences.theme !== currentTheme) {
      setCurrentTheme(preferences.theme)
    }
  }, [preferences.theme, currentTheme, setCurrentTheme])

  // Apply compact mode
  useEffect(() => {
    const body = document.body
    if (preferences.display.compactMode) {
      body.classList.add('compact-mode')
    } else {
      body.classList.remove('compact-mode')
    }
  }, [preferences.display.compactMode])

  // Apply show completed tasks preference
  useEffect(() => {
    const body = document.body
    if (!preferences.display.showCompletedTasks) {
      body.classList.add('hide-completed-tasks')
    } else {
      body.classList.remove('hide-completed-tasks')
    }
  }, [preferences.display.showCompletedTasks])

  // Apply language changes
  useEffect(() => {
    document.documentElement.lang = preferences.language
  }, [preferences.language])

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handlePreferenceChange = (section: keyof UserPreferences, key: string, value: any) => {
    setPreferences(prev => {
      const newPreferences = { ...prev }
      if (section === 'notifications') {
        newPreferences.notifications = { ...prev.notifications, [key]: value }
      } else if (section === 'display') {
        newPreferences.display = { ...prev.display, [key]: value }
      } else {
        (newPreferences as any)[section] = value
      }
      return newPreferences
    })
    setHasChanges(true)
    setError(null) // Clear any previous errors when user makes changes
    setSuccessMessage(null) // Clear success message when user makes changes
  }

  const handleSavePreferences = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save preferences',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Preferences saved successfully',
        })
        setSuccessMessage('Preferences saved successfully!')
        setHasChanges(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save preferences')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save preferences'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPreferences = async () => {
    // Ask for confirmation before resetting
    if (!confirm('Are you sure you want to reset all preferences to defaults? This action cannot be undone.')) {
      return
    }
    
    const defaultPreferences: UserPreferences = {
      theme: 'system',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        taskUpdates: true,
        projectUpdates: true,
        weeklyReports: false,
      },
      display: {
        compactMode: false,
        showCompletedTasks: true,
        defaultView: 'list',
      },
    }
    
    // Set local state immediately
    setPreferences(defaultPreferences)
    setCurrentTheme('system')
    setHasChanges(false) // No changes to save since we're resetting
    setError(null)
    setSuccessMessage('Preferences reset to defaults successfully!')
    
    // Automatically save the reset preferences
    if (user) {
      try {
        setIsResetting(true)
        setError(null)
        
        const response = await fetch('/api/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences: defaultPreferences }),
        })

        if (response.ok) {
          toast({
            title: 'Success',
            description: 'Preferences reset to defaults and saved successfully',
          })
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save reset preferences')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save reset preferences'
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
        // Revert to previous state if save failed
        setHasChanges(true)
      } finally {
        setIsResetting(false)
      }
    }
  }

  if (authLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading Preferences...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-48"></div>
                  </div>
                  <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">You must be logged in to manage preferences</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message Display */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-green-600">
              <Save className="h-5 w-5" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme and Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Appearance & Language</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  handlePreferenceChange('theme', 'theme', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current: {preferences.theme === 'system' ? 'System' : preferences.theme}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value: 'en' | 'es' | 'fr') => 
                  handlePreferenceChange('language', 'language', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current: {preferences.language === 'en' ? 'English' : preferences.language === 'es' ? 'Español' : 'Français'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.notifications.email}
                onCheckedChange={(checked) => 
                  handlePreferenceChange('notifications', 'email', checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive push notifications in browser</p>
              </div>
              <Switch
                id="push-notifications"
                checked={preferences.notifications.push}
                onCheckedChange={(checked) => 
                  handlePreferenceChange('notifications', 'push', checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="task-updates">Task Updates</Label>
                <p className="text-sm text-gray-500">Notify when task status changes</p>
              </div>
              <Switch
                id="task-updates"
                checked={preferences.notifications.taskUpdates}
                onCheckedChange={(checked) => 
                  handlePreferenceChange('notifications', 'taskUpdates', checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="project-updates">Project Updates</Label>
                <p className="text-sm text-gray-500">Notify when project details change</p>
              </div>
              <Switch
                id="project-updates"
                checked={preferences.notifications.projectUpdates}
                onCheckedChange={(checked) => 
                  handlePreferenceChange('notifications', 'projectUpdates', checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <p className="text-sm text-gray-500">Send weekly progress summaries</p>
              </div>
              <Switch
                id="weekly-reports"
                checked={preferences.notifications.weeklyReports}
                onCheckedChange={(checked) => 
                  handlePreferenceChange('notifications', 'weeklyReports', checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Display Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-sm text-gray-500">Use more condensed layout</p>
              </div>
              <Switch
                id="compact-mode"
                checked={preferences.display.compactMode}
                onCheckedChange={(checked) => 
                  handlePreferenceChange('display', 'compactMode', checked)
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-completed">Show Completed Tasks</Label>
                <p className="text-sm text-gray-500">Display completed tasks in lists</p>
              </div>
              <Switch
                id="show-completed"
                checked={preferences.display.showCompletedTasks}
                onCheckedChange={(checked) => 
                  handlePreferenceChange('display', 'showCompletedTasks', checked)
                }
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="default-view">Default View</Label>
              <Select
                value={preferences.display.defaultView}
                onValueChange={(value: 'list' | 'board' | 'calendar') => 
                  handlePreferenceChange('display', 'defaultView', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">List View</SelectItem>
                  <SelectItem value="board">Board View</SelectItem>
                  <SelectItem value="calendar">Calendar View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleResetPreferences}
          disabled={isLoading || isResetting}
          className="w-full sm:w-auto"
        >
          {isResetting ? 'Resetting...' : 'Reset All to Defaults'}
        </Button>
        
        {hasChanges && (
          <Button
            onClick={handleSavePreferences}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        )}
      </div>
    </div>
  )
}
