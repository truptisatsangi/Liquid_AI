'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Target,
  BarChart3
} from 'lucide-react'

interface PoolAllocation {
  name: string
  currentAllocation: number
  targetAllocation: number
  newAllocation: number
  change: number
  color: string
}

interface RebalancingStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  timestamp: Date
  pools?: PoolAllocation[]
}

export default function LiveRebalancing() {
  const [isRebalancing, setIsRebalancing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<RebalancingStep[]>([])
  const [pools, setPools] = useState<PoolAllocation[]>([
    { name: 'ETH/USDC', currentAllocation: 35, targetAllocation: 30, newAllocation: 30, change: -5, color: '#3b82f6' },
    { name: 'BTC/USDT', currentAllocation: 25, targetAllocation: 20, newAllocation: 20, change: -5, color: '#f59e0b' },
    { name: 'USDC/DAI', currentAllocation: 40, targetAllocation: 50, newAllocation: 50, change: 10, color: '#10b981' }
  ])
  const [isAnimating, setIsAnimating] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  const rebalancingSteps: RebalancingStep[] = [
    {
      id: '1',
      title: 'Market Analysis',
      description: 'AI analyzes current market conditions and volatility patterns',
      status: 'pending',
      timestamp: new Date()
    },
    {
      id: '2',
      title: 'Portfolio Assessment',
      description: 'Evaluating current allocation against risk tolerance',
      status: 'pending',
      timestamp: new Date()
    },
    {
      id: '3',
      title: 'Rebalancing Strategy',
      description: 'MeTTa reasoning generates optimal allocation strategy',
      status: 'pending',
      timestamp: new Date()
    },
    {
      id: '4',
      title: 'User Approval',
      description: 'Presenting rebalancing proposal for user review',
      status: 'pending',
      timestamp: new Date()
    },
    {
      id: '5',
      title: 'Execution',
      description: 'Executing rebalancing transactions on-chain',
      status: 'pending',
      timestamp: new Date()
    },
    {
      id: '6',
      title: 'Verification',
      description: 'Confirming new allocations and updating portfolio',
      status: 'pending',
      timestamp: new Date()
    }
  ]

  const startRebalancing = () => {
    setIsRebalancing(true)
    setSteps([...rebalancingSteps])
    setCurrentStep(0)
    setIsAnimating(true)
    
    // Start the rebalancing simulation
    simulateRebalancing()
  }

  const simulateRebalancing = () => {
    let stepIndex = 0
    
    const executeStep = () => {
      if (stepIndex < rebalancingSteps.length) {
        // Update current step to in-progress
        setSteps(prev => prev.map((step, index) => 
          index === stepIndex 
            ? { ...step, status: 'in-progress', timestamp: new Date() }
            : step
        ))
        
        // Simulate step execution time
        setTimeout(() => {
          // Mark current step as completed
          setSteps(prev => prev.map((step, index) => 
            index === stepIndex 
              ? { ...step, status: 'completed', timestamp: new Date() }
              : step
          ))
          
          // Move to next step
          stepIndex++
          setCurrentStep(stepIndex)
          
          if (stepIndex < rebalancingSteps.length) {
            // Continue to next step
            setTimeout(executeStep, 1000)
          } else {
            // Rebalancing complete
            setIsRebalancing(false)
            setIsAnimating(false)
            animatePoolChanges()
          }
        }, 2000) // 2 seconds per step
      }
    }
    
    executeStep()
  }

  const animatePoolChanges = () => {
    // Animate the pool allocation changes
    setPools(prev => prev.map(pool => ({
      ...pool,
      currentAllocation: pool.newAllocation
    })))
  }

  const resetDemo = () => {
    setIsRebalancing(false)
    setCurrentStep(0)
    setSteps([])
    setIsAnimating(false)
    setPools([
      { name: 'ETH/USDC', currentAllocation: 35, targetAllocation: 30, newAllocation: 30, change: -5, color: '#3b82f6' },
      { name: 'BTC/USDT', currentAllocation: 25, targetAllocation: 20, newAllocation: 20, change: -5, color: '#f59e0b' },
      { name: 'USDC/DAI', currentAllocation: 40, targetAllocation: 50, newAllocation: 50, change: 10, color: '#10b981' }
    ])
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in-progress':
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'in-progress':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Target className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">Live Portfolio Rebalancing</h2>
            <p className="text-sm text-secondary-600">Watch AI rebalance your portfolio in real-time</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isRebalancing ? (
            <button
              onClick={startRebalancing}
              className="btn btn-primary flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Start Rebalancing
            </button>
          ) : (
            <button
              onClick={resetDemo}
              className="btn btn-secondary flex items-center gap-2"
            >
              Reset Demo
            </button>
          )}
        </div>
      </div>

      {/* Portfolio Allocation Visualization */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-secondary-900 mb-4">Portfolio Allocation</h3>
        <div className="space-y-3">
          {pools.map((pool, index) => (
            <div key={pool.name} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-secondary-700">{pool.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-secondary-600">
                    {pool.currentAllocation}% → {pool.newAllocation}%
                  </span>
                  {pool.change !== 0 && (
                    <div className={`flex items-center gap-1 text-xs ${
                      pool.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {pool.change > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(pool.change)}%
                    </div>
                  )}
                </div>
              </div>
              
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                {/* Current allocation */}
                <div 
                  className="absolute top-0 left-0 h-full bg-gray-300 rounded-full transition-all duration-1000"
                  style={{ width: `${pool.currentAllocation}%` }}
                />
                
                {/* New allocation (animated) */}
                <div 
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                    isAnimating ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ 
                    width: `${pool.newAllocation}%`,
                    backgroundColor: pool.color
                  }}
                />
                
                {/* Change indicator */}
                {pool.change !== 0 && (
                  <div className="absolute top-0 h-full flex items-center">
                    <div 
                      className="w-1 h-full bg-white opacity-80"
                      style={{ left: `${Math.min(pool.currentAllocation, pool.newAllocation)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rebalancing Steps */}
      {steps.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-md font-semibold text-secondary-900">Rebalancing Process</h3>
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`p-4 rounded-lg border transition-all duration-500 ${
                getStepColor(step.status)
              }`}
            >
              <div className="flex items-center gap-3">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm opacity-80">{step.description}</p>
                </div>
                <div className="text-xs opacity-60">
                  {step.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MeTTa Reasoning Display */}
      {isRebalancing && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg text-white">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-semibold">MeTTa Reasoning Engine</span>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Rule:</span> 
              <span className="text-yellow-300 ml-2">volatility_high → rebalance_to_stables</span>
            </div>
            <div>
              <span className="text-gray-400">Confidence:</span> 
              <span className="text-green-300 ml-2">0.89</span>
            </div>
            <div>
              <span className="text-gray-400">Action:</span> 
              <span className="text-purple-300 ml-2">execute_rebalance</span>
            </div>
            <div>
              <span className="text-gray-400">Strategy:</span> 
              <span className="text-blue-300 ml-2">Reduce volatile assets by 10%, increase stable allocation</span>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {isRebalancing && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-xs font-medium text-green-700">Risk Reduction</div>
            <div className="text-lg font-bold text-green-800">-12%</div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs font-medium text-blue-700">Expected APR</div>
            <div className="text-lg font-bold text-blue-800">4.2%</div>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="text-xs font-medium text-purple-700">Gas Cost</div>
            <div className="text-lg font-bold text-purple-800">$23</div>
          </div>
        </div>
      )}
    </div>
  )
}
