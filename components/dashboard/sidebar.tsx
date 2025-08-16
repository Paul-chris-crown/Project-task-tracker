'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useTheme } from '@/components/theme-provider'
import CreateProjectDialog from '@/components/projects/create-project-dialog'
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Settings,
  Users,
  Plus,
  Shield,
  LogOut,
  Sun,
  Moon
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen, show: true },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare, show: true },
    { name: 'Stats Dashboard', href: '/dashboard/stats', icon: Users, show: true },
    { name: 'User Management', href: '/admin/users', icon: Shield, show: user?.role === 'ADMIN' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, show: true },
  ]

  const handleLogout = async () => {
    await logout()
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Task Tracker</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation
          .filter(item => item.show !== false)
          .map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
      </nav>

      {/* User Info & Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user ? user.email : (isLoading ? 'Loading...' : 'Unknown')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user ? user.role : (isLoading ? 'Loading...' : 'Unknown')}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => setIsCreateProjectOpen(true)}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleTheme}
            className="flex-1"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog 
        isOpen={isCreateProjectOpen} 
        onClose={() => setIsCreateProjectOpen(false)} 
      />
    </div>
  )
}
