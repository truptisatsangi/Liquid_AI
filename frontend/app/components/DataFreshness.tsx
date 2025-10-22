'use client'

import { useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface DataFreshnessProps {
  lastUpdate: Date
  isUpdating?: boolean
  source?: string
}

export default function DataFreshness({ lastUpdate, isUpdating = false, source = 'Envio' }: DataFreshnessProps) {
  const [timeSince, setTimeSince] = useState('')

  useEffect(() => {
    const updateTimeSince = () => {
      const now = new Date()
      const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)
      
      if (diff < 60) {
        setTimeSince(`${diff}s ago`)
      } else if (diff < 3600) {
        setTimeSince(`${Math.floor(diff / 60)}m ago`)
      } else {
        setTimeSince(`${Math.floor(diff / 3600)}h ago`)
      }
    }

    updateTimeSince()
    const interval = setInterval(updateTimeSince, 1000)
    return () => clearInterval(interval)
  }, [lastUpdate])

  return (
    <div className="flex items-center gap-2 text-xs text-secondary-500">
      {isUpdating ? (
        <RefreshCw className="w-3 h-3 text-primary-500 animate-spin" />
      ) : (
        <Wifi className="w-3 h-3 text-success-500" />
      )}
      
      <span>
        Updated {timeSince} via {source}
      </span>
      
      {isUpdating && (
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 bg-primary-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
    </div>
  )
}
