'use client'

import { useState } from 'react'
import { 
  Settings, 
  X, 
  Code, 
  Database, 
  Zap, 
  Globe, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Terminal
} from 'lucide-react'

interface UnderTheHoodModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UnderTheHoodModal({ isOpen, onClose }: UnderTheHoodModalProps) {
  const [activeTab, setActiveTab] = useState<'envio' | 'pyth' | 'asi' | 'hardhat'>('envio')

  const tabs = [
    { id: 'envio', name: 'Envio', icon: <Database className="w-4 h-4" /> },
    { id: 'pyth', name: 'Pyth', icon: <Zap className="w-4 h-4" /> },
    { id: 'asi', name: 'ASI', icon: <Globe className="w-4 h-4" /> },
    { id: 'hardhat', name: 'Hardhat', icon: <Code className="w-4 h-4" /> }
  ]

  const envioData = {
    endpoint: 'https://api.envio.dev/liquidai',
    indexedPools: 8,
    lastUpdate: '2 seconds ago',
    queries: [
      'PoolMetrics',
      'VolumeData',
      'TVLHistory',
      'FeeData'
    ]
  }

  const pythData = {
    priceFeeds: ['ETH/USD', 'BTC/USD', 'USDC/USD'],
    updateFrequency: '400ms',
    lastUpdate: '1 second ago',
    confidence: '99.9%'
  }

  const asiData = {
    agents: ['Observer', 'Allocator', 'Executor'],
    network: 'ASI:One',
    reasoning: 'MeTTa',
    lastAction: 'Rebalance proposal generated'
  }

  const hardhatData = {
    version: '3.0.0',
    network: 'Ethereum Mainnet',
    contracts: ['LiquidityVault.sol'],
    lastDeploy: '2 hours ago'
  }

  const getTabData = () => {
    switch (activeTab) {
      case 'envio': return envioData
      case 'pyth': return pythData
      case 'asi': return asiData
      case 'hardhat': return hardhatData
      default: return envioData
    }
  }

  const currentData = getTabData()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Settings className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-secondary-900">Under the Hood</h3>
              <p className="text-sm text-secondary-600">Technical architecture and integrations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'envio' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-primary-600" />
                    <span className="font-medium text-secondary-900">API Endpoint</span>
                  </div>
                  <p className="text-sm text-secondary-600 font-mono">{envioData.endpoint}</p>
                </div>
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-success-600" />
                    <span className="font-medium text-secondary-900">Indexed Pools</span>
                  </div>
                  <p className="text-2xl font-bold text-success-600">{envioData.indexedPools}</p>
                </div>
              </div>
              
              <div className="p-4 bg-secondary-50 rounded-lg">
                <h4 className="font-medium text-secondary-900 mb-3">Active Queries</h4>
                <div className="grid grid-cols-2 gap-2">
                  {envioData.queries.map((query, index) => (
                    <div
                      key={query}
                      className="flex items-center gap-2 p-2 bg-white rounded border"
                    >
                      <Terminal className="w-3 h-3 text-primary-600" />
                      <span className="text-sm font-mono">{query}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pyth' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-warning-600" />
                    <span className="font-medium text-secondary-900">Update Frequency</span>
                  </div>
                  <p className="text-2xl font-bold text-warning-600">{pythData.updateFrequency}</p>
                </div>
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-success-600" />
                    <span className="font-medium text-secondary-900">Confidence</span>
                  </div>
                  <p className="text-2xl font-bold text-success-600">{pythData.confidence}</p>
                </div>
              </div>
              
              <div className="p-4 bg-secondary-50 rounded-lg">
                <h4 className="font-medium text-secondary-900 mb-3">Active Price Feeds</h4>
                <div className="space-y-2">
                  {pythData.priceFeeds.map((feed, index) => (
                    <div
                      key={feed}
                      className="flex items-center justify-between p-3 bg-white rounded border"
                    >
                      <span className="font-medium">{feed}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-success-600">Live</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'asi' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-primary-600" />
                    <span className="font-medium text-secondary-900">Network</span>
                  </div>
                  <p className="text-lg font-bold text-primary-600">{asiData.network}</p>
                </div>
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-secondary-600" />
                    <span className="font-medium text-secondary-900">Last Action</span>
                  </div>
                  <p className="text-sm text-secondary-600">{asiData.lastAction}</p>
                </div>
              </div>
              
              <div className="p-4 bg-secondary-50 rounded-lg">
                <h4 className="font-medium text-secondary-900 mb-3">Active Agents</h4>
                <div className="space-y-2">
                  {asiData.agents.map((agent, index) => (
                    <div
                      key={agent}
                      className="flex items-center justify-between p-3 bg-white rounded border"
                    >
                      <span className="font-medium">{agent} Agent</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-success-600">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hardhat' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-primary-600" />
                    <span className="font-medium text-secondary-900">Version</span>
                  </div>
                  <p className="text-2xl font-bold text-primary-600">{hardhatData.version}</p>
                </div>
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-secondary-600" />
                    <span className="font-medium text-secondary-900">Network</span>
                  </div>
                  <p className="text-lg font-bold text-secondary-600">{hardhatData.network}</p>
                </div>
              </div>
              
              <div className="p-4 bg-secondary-50 rounded-lg">
                <h4 className="font-medium text-secondary-900 mb-3">Deployed Contracts</h4>
                <div className="space-y-2">
                  {hardhatData.contracts.map((contract, index) => (
                    <div
                      key={contract}
                      className="flex items-center justify-between p-3 bg-white rounded border"
                    >
                      <span className="font-mono text-sm">{contract}</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success-600" />
                        <span className="text-sm text-success-600">Deployed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
