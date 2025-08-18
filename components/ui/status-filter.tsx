'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, X } from 'lucide-react'

export interface StatusFilterOption {
  value: string
  label: string
  color: string
  count?: number
}

interface StatusFilterProps {
  options: StatusFilterOption[]
  selectedStatus: string | null
  onStatusChange: (status: string | null) => void
  title?: string
  showCounts?: boolean
}

export function StatusFilter({ 
  options, 
  selectedStatus, 
  onStatusChange, 
  title = "Filter by Status",
  showCounts = true 
}: StatusFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleStatusClick = (status: string) => {
    if (selectedStatus === status) {
      onStatusChange(null) // Clear filter if same status clicked
    } else {
      onStatusChange(status)
    }
  }

  const clearFilter = () => {
    onStatusChange(null)
  }

  return (
    <div className="space-y-3">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
          {selectedStatus && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? 'Hide' : 'Show'} Filters
        </Button>
      </div>

      {/* Filter Options */}
      {isExpanded && (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = selectedStatus === option.value
            return (
              <Button
                key={option.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusClick(option.value)}
                className={`h-8 px-3 text-xs transition-all ${
                  isSelected 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Badge 
                  variant="secondary" 
                  className={`mr-2 text-xs ${option.color}`}
                >
                  {option.label}
                </Badge>
                {showCounts && option.count !== undefined && (
                  <span className="ml-1 text-xs opacity-75">
                    ({option.count})
                  </span>
                )}
              </Button>
            )
          })}
        </div>
      )}

      {/* Active Filter Display */}
      {selectedStatus && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Showing:</span>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            {options.find(opt => opt.value === selectedStatus)?.label || selectedStatus}
          </Badge>
        </div>
      )}
    </div>
  )
}
