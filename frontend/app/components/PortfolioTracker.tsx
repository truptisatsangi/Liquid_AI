'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity,
  Target,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface PortfolioMetric {
  name: string
  current: number
  target: number
  change: number
  trend: 'up' | 'down' | 'stable'
  color: string
}

interface RebalancingEvent {
  id: string
  timestamp: Date
  type: 'analysis' | 'proposal' | 'execution' | 'completion'
  message: string
  data?: any
}

export default function PortfolioTracker() {
  const [metrics, setMetrics] = useState<PortfolioMetric[]>([
    { name: 'Total Value Locked', current: 1250000, target: 1200000, change: 4.2, trend: 'up', color: '#10b981' },
    { name: 'Average APR', current: 4.8, target: 4.5, change: 6.7, trend: 'up', color: '#3b82f6' },
    { name: 'Portfolio Volatility', current: 18.5, target: 15.0, change: -18.9, trend: 'down', color: '#f59e0b' },
    { name: 'Risk Score', current: 6.2, target: 5.0, change: -19.4, trend: 'down', color: '#ef4444' }
  ])

  const [events, setEvents] = useState<RebalancingEvent[]>([])
  const [isLive, setIsLive] = useState(false)
  const [currentRebalancing, setCurrentRebalancing] = useState<any>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isLive) {
      startLiveTracking()
    } else {
      stopLiveTracking()
    }
    
    return () => stopLiveTracking()
  }, [isLive])

  const startLiveTracking = () => {
    // Simulate real-time updates
    intervalRef.current = setInterval(() => {
      updateMetrics()
      generateEvent()
    }, 3000) // Update every 3 seconds
  }

  const stopLiveTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const updateMetrics = () => {
    setMetrics(prev => prev.map(metric => {
      const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
      const newValue = metric.current * (1 + variation)
      
      return {
        ...metric,
        current: Math.round(newValue * 100) / 100,
        change: Math.round((newValue - metric.target) / metric.target * 100 * 100) / 100
      }
    }))
  }

  const generateEvent = () => {
    const eventTypes = [
      { type: 'analysis', message: 'AI analyzing market volatility patterns' },
      { type: 'proposal', message: 'New rebalancing proposal generated' },
      { type: 'execution', message: 'Executing portfolio rebalancing' },
      { type: 'completion', message: 'Rebalancing completed successfully' }
    ]
    
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    
    const newEvent: RebalancingEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: randomEvent.type as any,
      message: randomEvent.message
    }
    
    setEvents(prev => [newEvent, ...prev.slice(0, 9)]) // Keep last 10 events
  }

  const triggerRebalancing = () => {
    setCurrentRebalancing({
      id: Date.now().toString(),
      startTime: new Date(),
      status: 'in-progress'
    })
    
    // Simulate rebalancing process
    setTimeout(() => {
      setCurrentRebalancing(prev => ({
        ...prev,
        status: 'completed',
        endTime: new Date()
      }))
      
      // Update metrics after rebalancing
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        current: metric.target + (Math.random() - 0.5) * metric.target * 0.05,
        change: Math.round((Math.random() - 0.5) * 10 * 100) / 100
      })))
    }, 5000)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'analysis':
        return <Activity className="w-4 h-4 text-blue-500" />
      case 'proposal':
        return <Target className="w-4 h-4 text-purple-500" />
      case 'execution':
        return <Zap className="w-4 h-4 text-yellow-500" />
      case 'completion':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'analysis':
        return 'bg-blue-50 border-blue-200'
      case 'proposal':
        return 'bg-purple-50 border-purple-200'
      case 'execution':
        return 'bg-yellow-50 border-yellow-200'
      case 'completion':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">Live Portfolio Tracker</h2>
            <p className="text-sm text-secondary-600">Real-time portfolio performance monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isLive 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            {isLive ? 'Live' : 'Paused'}
          </div>
          
          <button
            onClick={() => setIsLive(!isLive)}
            className={`btn ${isLive ? 'btn-secondary' : 'btn-primary'} text-sm`}
          >
            {isLive ? 'Pause' : 'Start'} Tracking
          </button>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div key={metric.name} className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{metric.name}</span>
              <div className={`flex items-center gap-1 text-xs ${
                metric.trend === 'up' ? 'text-green-600' : 
                metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : metric.trend === 'down' ? (
                  <TrendingDown className="w-3 h-3" />
                ) : null}
                {Math.abs(metric.change).toFixed(1)}%
              </div>
            </div>
            
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metric.name.includes('TVL') ? `$${(metric.current / 1000000).toFixed(1)}M` :
               metric.name.includes('APR') ? `${metric.current.toFixed(1)}%` :
               metric.name.includes('Volatility') ? `${metric.current.toFixed(1)}%` :
               metric.current.toFixed(1)}
            </div>
            
            <div className="text-xs text-gray-500">
              Target: {metric.name.includes('TVL') ? `$${(metric.target / 1000000).toFixed(1)}M` :
                      metric.name.includes('APR') ? `${metric.target.toFixed(1)}%` :
                      metric.name.includes('Volatility') ? `${metric.target.toFixed(1)}%` :
                      metric.target.toFixed(1)}
            </div>
            
            {/* Progress bar */}
            <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, Math.max(0, (metric.current / metric.target) * 100))}%`,
                  backgroundColor: metric.color
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Current Rebalancing Status */}
      {currentRebalancing && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Active Rebalancing</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              currentRebalancing.status === 'completed' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {currentRebalancing.status === 'completed' ? 'Completed' : 'In Progress'}
            </div>
          </div>
          
          <div className="text-sm text-blue-800">
            {currentRebalancing.status === 'completed' 
              ? `Rebalancing completed in ${Math.round((currentRebalancing.endTime - currentRebalancing.startTime) / 1000)}s`
              : 'AI is executing portfolio rebalancing...'
            }
          </div>
        </div>
      )}

      {/* Live Events Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-semibold text-secondary-900">Live Events</h3>
          <button
            onClick={triggerRebalancing}
            disabled={currentRebalancing?.status === 'in-progress'}
            className="btn btn-primary text-sm"
          >
            Trigger Rebalancing
          </button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.map((event) => (
            <div 
              key={event.id}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                getEventColor(event.type)
              }`}
            >
              <div className="flex items-center gap-3">
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.message}</p>
                  <p className="text-xs text-gray-500">
                    {event.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
