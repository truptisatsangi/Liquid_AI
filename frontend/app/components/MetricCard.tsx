'use client'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

export default function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
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
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
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
      </div>
      
      <div className="metric-value mb-1">
        {value}
      </div>
      
      <div className="metric-label">
        {title}
      </div>
    </div>
  )
}
