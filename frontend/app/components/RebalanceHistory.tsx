'use client'

import { useState } from 'react'
import { Clock, CheckCircle, XCircle, ExternalLink, Zap } from 'lucide-react'

interface RebalanceEvent {
  id: string
  proposalId: string
  timestamp: number
  executed: boolean
  reason: string
  pools: string[]
  ratios: number[]
  transactionHash?: string
  gasUsed?: string
}

export default function RebalanceHistory() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  // Mock rebalance history data
  const rebalanceEvents: RebalanceEvent[] = [
    {
      id: '1',
      proposalId: '1',
      timestamp: Date.now() - 3600000, // 1 hour ago
      executed: true,
      reason: 'Risk reduction due to high volatility',
      pools: ['ETH/USDC', 'BTC/USDC'],
      ratios: [60, 40],
      transactionHash: '0x1234...5678',
      gasUsed: '150,000'
    },
    {
      id: '2',
      proposalId: '2',
      timestamp: Date.now() - 7200000, // 2 hours ago
      executed: true,
      reason: 'Yield optimization for better returns',
      pools: ['ETH/USDC', 'ETH/BTC', 'USDC/USDT'],
      ratios: [45, 35, 20],
      transactionHash: '0x2345...6789',
      gasUsed: '180,000'
    },
    {
      id: '3',
      proposalId: '3',
      timestamp: Date.now() - 10800000, // 3 hours ago
      executed: false,
      reason: 'Portfolio diversification across stable pools',
      pools: ['USDC/USDT', 'DAI/USDC'],
      ratios: [70, 30]
    },
    {
      id: '4',
      proposalId: '4',
      timestamp: Date.now() - 14400000, // 4 hours ago
      executed: true,
      reason: 'Increased allocation to high-volume pools',
      pools: ['ETH/USDC', 'BTC/USDC'],
      ratios: [55, 45],
      transactionHash: '0x3456...7890',
      gasUsed: '165,000'
    }
  ]

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  const getStatusIcon = (executed: boolean) => {
    return executed ? (
      <CheckCircle className="w-4 h-4 text-success-600" />
    ) : (
      <Clock className="w-4 h-4 text-warning-600" />
    )
  }

  const getStatusText = (executed: boolean) => {
    return executed ? 'Executed' : 'Pending'
  }

  const getStatusColor = (executed: boolean) => {
    return executed ? 'text-success-600' : 'text-warning-600'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Zap className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">Rebalance History</h2>
            <p className="text-sm text-secondary-600">Recent allocation changes</p>
          </div>
        </div>
        <button className="btn btn-secondary text-sm">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {rebalanceEvents.map((event) => (
          <div
            key={event.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedEvent === event.id
                ? 'border-primary-200 bg-primary-50'
                : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50'
            }`}
            onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
          >
            {/* Event Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(event.executed)}
                <div>
                  <div className="font-medium text-secondary-900">
                    Proposal #{event.proposalId}
                  </div>
                  <div className="text-sm text-secondary-600">
                    {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                  </div>
                </div>
              </div>
              <div className={`text-sm font-medium ${getStatusColor(event.executed)}`}>
                {getStatusText(event.executed)}
              </div>
            </div>

            {/* Event Details */}
            <div className="text-sm text-secondary-700 mb-3">
              {event.reason}
            </div>

            {/* Pool Allocations */}
            <div className="space-y-2">
              {event.pools.map((pool, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">{pool}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-secondary-200 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full"
                        style={{ width: `${event.ratios[index]}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-secondary-900 w-8">
                      {event.ratios[index]}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Expanded Details */}
            {selectedEvent === event.id && (
              <div className="mt-4 pt-4 border-t border-secondary-200 space-y-3">
                {event.executed && event.transactionHash && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Transaction:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-secondary-900">
                        {event.transactionHash}
                      </span>
                      <button className="p-1 text-secondary-400 hover:text-secondary-600">
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                {event.executed && event.gasUsed && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-secondary-600">Gas Used:</span>
                    <span className="font-medium text-secondary-900">{event.gasUsed}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-600">Pools Affected:</span>
                  <span className="font-medium text-secondary-900">{event.pools.length}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-600">Total Allocation:</span>
                  <span className="font-medium text-secondary-900">
                    {event.ratios.reduce((sum, ratio) => sum + ratio, 0)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-secondary-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-secondary-900">
              {rebalanceEvents.length}
            </div>
            <div className="text-xs text-secondary-600">Total Proposals</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-success-600">
              {rebalanceEvents.filter(e => e.executed).length}
            </div>
            <div className="text-xs text-secondary-600">Executed</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-warning-600">
              {rebalanceEvents.filter(e => !e.executed).length}
            </div>
            <div className="text-xs text-secondary-600">Pending</div>
          </div>
        </div>
      </div>
    </div>
  )
}
