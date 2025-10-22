'use client'

import { useState } from 'react'
import { Brain, Activity, CheckCircle, AlertCircle, Clock, Zap, Wifi, Database, Hash } from 'lucide-react'

interface AgentStatusProps {
  isRunning: boolean
}

export default function AgentStatus({ isRunning }: AgentStatusProps) {
  const [selectedAgent, setSelectedAgent] = useState<'observer' | 'allocator' | 'executor'>('observer')
  const [showLogs, setShowLogs] = useState(false)

  const agents = {
    observer: {
      name: 'Observer Agent',
      description: 'Monitors market conditions and pool metrics',
      status: 'active',
      lastActivity: '2 minutes ago',
      metrics: {
        observations: 1247,
        uptime: '99.8%',
        avgResponseTime: '1.2s'
      }
    },
    allocator: {
      name: 'Allocator Agent',
      description: 'Analyzes data and generates allocation strategies',
      status: isRunning ? 'active' : 'idle',
      lastActivity: isRunning ? '30 seconds ago' : '5 minutes ago',
      metrics: {
        strategies: 23,
        confidence: '87%',
        successRate: '94%'
      }
    },
    executor: {
      name: 'Executor Agent',
      description: 'Executes rebalance proposals on-chain',
      status: 'standby',
      lastActivity: '1 hour ago',
      metrics: {
        executions: 8,
        gasUsed: '2.1 ETH',
        successRate: '100%'
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success-600 bg-success-50 border-success-200'
      case 'idle':
        return 'text-warning-600 bg-warning-50 border-warning-200'
      case 'standby':
        return 'text-secondary-600 bg-secondary-50 border-secondary-200'
      default:
        return 'text-danger-600 bg-danger-50 border-danger-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'idle':
        return <Clock className="w-4 h-4" />
      case 'standby':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const currentAgent = agents[selectedAgent]

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-50 rounded-lg">
          <Brain className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-secondary-900">Agent Status</h2>
          <p className="text-sm text-secondary-600">AI agent monitoring and control</p>
        </div>
      </div>

      {/* Mini Cards for System Status */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-success-600" />
            <span className="text-xs font-medium text-success-700">Price Sources</span>
          </div>
          <div className="text-lg font-bold text-success-800">3/3</div>
        </div>
        
        <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-medium text-primary-700">Indexed Pools</span>
          </div>
          <div className="text-lg font-bold text-primary-800">8</div>
        </div>
        
        <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-warning-600" />
            <span className="text-xs font-medium text-warning-700">Last TX</span>
          </div>
          <div className="text-xs font-mono text-warning-800">0x2345...6789</div>
        </div>
      </div>

      {/* Agent Tabs */}
      <div className="flex gap-2 mb-6">
        {Object.entries(agents).map(([key, agent]) => (
          <button
            key={key}
            onClick={() => setSelectedAgent(key as any)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedAgent === key
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
            }`}
          >
            {agent.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Selected Agent Details */}
      <div className="space-y-4">
        {/* Agent Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-secondary-900">{currentAgent.name}</h3>
            <p className="text-sm text-secondary-600">{currentAgent.description}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentAgent.status)}`}>
            <div className="flex items-center gap-2">
              {getStatusIcon(currentAgent.status)}
              <span className="capitalize">{currentAgent.status}</span>
            </div>
          </div>
        </div>

        {/* Agent Metrics */}
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(currentAgent.metrics).map(([key, value]) => (
            <div key={key} className="text-center p-3 bg-secondary-50 rounded-lg">
              <div className="text-lg font-bold text-secondary-900">{value}</div>
              <div className="text-xs text-secondary-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>

        {/* Last Activity */}
        <div className="flex items-center gap-2 text-sm text-secondary-600">
          <Clock className="w-4 h-4" />
          <span>Last activity: {currentAgent.lastActivity}</span>
        </div>

        {/* Overall Status */}
        <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
          <div className={`w-3 h-3 rounded-full ${
            isRunning ? 'bg-success-500 animate-pulse' : 'bg-secondary-400'
          }`}></div>
          <span className="font-medium">
            {isRunning ? 'All Systems Operational' : 'Standby Mode'}
          </span>
        </div>
      </div>

      {/* View Logs Button */}
      <div className="mt-6 pt-4 border-t border-secondary-200">
        <button
          onClick={() => setShowLogs(true)}
          className="w-full btn btn-secondary flex items-center justify-center gap-2"
        >
          <Activity className="w-4 h-4" />
          View Agent Logs
        </button>
      </div>

      {/* Logs Modal */}
      {showLogs && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLogs(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">Agent Activity Logs</h3>
              <button
                onClick={() => setShowLogs(false)}
                className="text-secondary-400 hover:text-secondary-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                <div className="w-2 h-2 rounded-full mt-2 bg-primary-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-secondary-900">Observer</span>
                    <span className="text-xs text-secondary-500">2:30 PM</span>
                  </div>
                  <p className="text-sm text-secondary-700">Fetching latest price data from Pyth Network</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                <div className="w-2 h-2 rounded-full mt-2 bg-success-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-secondary-900">Observer</span>
                    <span className="text-xs text-secondary-500">2:29 PM</span>
                  </div>
                  <p className="text-sm text-secondary-700">Successfully updated pool metrics via Envio</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                <div className="w-2 h-2 rounded-full mt-2 bg-primary-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-secondary-900">Allocator</span>
                    <span className="text-xs text-secondary-500">2:28 PM</span>
                  </div>
                  <p className="text-sm text-secondary-700">Analyzing market volatility patterns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
