'use client'

// import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface MetricCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  description?: string
  isUpdating?: boolean
  index?: number
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  description,
  isUpdating = false,
  index = 0
}: MetricCardProps) {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-50',
    success: 'text-success-600 bg-success-50',
    warning: 'text-warning-600 bg-warning-50',
    danger: 'text-danger-600 bg-danger-50',
    info: 'text-secondary-600 bg-secondary-50'
  }

  const isPositive = change > 0
  const isNeutral = change === 0

  return (
    <TooltipProvider>
      <div className="metric-card relative">
        {/* Pulse animation for updates */}
        {isUpdating && (
          <div className="absolute inset-0 rounded-xl bg-primary-100 opacity-20 animate-pulse" />
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${colorClasses[color]} relative`}>
            {icon}
            {isUpdating && (
              <div className="absolute inset-0 rounded-lg bg-primary-200 opacity-50 animate-pulse" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isNeutral && (
              <div className={`flex items-center gap-1 text-sm ${
                  isPositive ? 'text-success-600' : 'text-danger-600'
                }`}>
                {isPositive ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {Math.abs(change).toFixed(1)}%
                </span>
              </div>
            )}
            
            {description && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-secondary-400 hover:text-secondary-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm max-w-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        
        <div className="metric-value mb-1">
          {value}
        </div>
        
        <div className="metric-label">
          {title}
        </div>
      </div>
    </TooltipProvider>
  )
}
