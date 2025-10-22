'use client'

import { useState } from 'react'
import { Brain, Activity, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react'

interface AgentStatusProps {
  isRunning: boolean
}

export default function AgentStatus({ isRunning }: AgentStatusProps) {
  const [selectedAgent, setSelectedAgent] = useState<'observer' | 'allocator' | 'executor'>('observer')

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
            <h3 className="font-medium text-secondary-900">{currentAgent.name}</h3>
            <p className="text-sm text-secondary-600">{currentAgent.description}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(currentAgent.status)}`}>
            {getStatusIcon(currentAgent.status)}
            {currentAgent.status}
          </div>
        </div>

        {/* Agent Metrics */}
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(currentAgent.metrics).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-lg font-semibold text-secondary-900">{value}</div>
              <div className="text-xs text-secondary-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>

        {/* Last Activity */}
        <div className="flex items-center gap-2 text-sm text-secondary-600">
          <Activity className="w-4 h-4" />
          Last activity: {currentAgent.lastActivity}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-secondary-200">
          <div className="flex gap-2">
            <button className="btn btn-primary flex-1 text-sm">
              <Zap className="w-4 h-4" />
              Trigger Action
            </button>
            <button className="btn btn-secondary text-sm">
              View Logs
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6 pt-4 border-t border-secondary-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-600">System Status</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isRunning ? 'bg-success-500' : 'bg-warning-500'
            }`}></div>
            <span className="font-medium">
              {isRunning ? 'All Systems Operational' : 'Standby Mode'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
