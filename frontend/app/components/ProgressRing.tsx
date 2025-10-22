'use client'

import { motion } from 'framer-motion'

interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showValue?: boolean
  label?: string
}

export default function ProgressRing({
  value,
  max = 100,
  size = 40,
  strokeWidth = 4,
  color = '#3b82f6',
  backgroundColor = '#e2e8f0',
  showValue = true,
  label
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min((value / max) * 100, 100)
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </svg>
        
        {/* Center value */}
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-secondary-900">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
      
      {label && (
        <span className="text-xs text-secondary-600 mt-1 text-center">
          {label}
        </span>
      )}
    </div>
  )
}
