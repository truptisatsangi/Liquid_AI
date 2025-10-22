'use client'

import { useState } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Zap, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface DemoStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'active' | 'completed' | 'error'
}

export default function DemoModeSwitch() {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const demoSteps: DemoStep[] = [
    {
      id: 'fetch-prices',
      title: 'Fetching Prices',
      description: 'Pulling real-time data from Pyth Network',
      icon: <Zap className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'update-metrics',
      title: 'Updating Metrics',
      description: 'Processing data via Envio HyperIndex',
      icon: <CheckCircle className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'agent-analysis',
      title: 'Agent Analysis',
      description: 'ASI agents evaluating market conditions',
      icon: <Clock className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'generate-proposal',
      title: 'Generate Proposal',
      description: 'MeTTa reasoning engine creating strategy',
      icon: <AlertCircle className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'execute-tx',
      title: 'Execute Transaction',
      description: 'Broadcasting rebalance to blockchain',
      icon: <Zap className="w-4 h-4" />,
      status: 'pending'
    }
  ]

  const runDemo = async () => {
    setIsRunning(true)
    setCurrentStep(0)

    for (let i = 0; i < demoSteps.length; i++) {
      setCurrentStep(i)
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 seconds per step
    }

    setIsRunning(false)
    setCurrentStep(0)
  }

  const getStepStatus = (index: number): DemoStep['status'] => {
    if (index < currentStep) return 'completed'
    if (index === currentStep && isRunning) return 'active'
    return 'pending'
  }

  const getStatusColor = (status: DemoStep['status']) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-50'
      case 'active': return 'text-primary-600 bg-primary-50'
      case 'error': return 'text-danger-600 bg-danger-50'
      default: return 'text-secondary-400 bg-secondary-50'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Play className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">Demo Mode</h2>
            <p className="text-sm text-secondary-600">Simulate complete LiquidAI workflow</p>
          </div>
        </div>
        
        <motion.button
          onClick={() => {
            setIsDemoMode(!isDemoMode)
            if (!isDemoMode && !isRunning) {
              runDemo()
            }
          }}
          className={`btn flex items-center gap-2 ${
            isDemoMode ? 'btn-danger' : 'btn-primary'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isDemoMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isDemoMode ? 'Stop Demo' : 'Start Demo'}
        </motion.button>
      </div>

      <AnimatePresence>
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-secondary-600 mb-2">
                <span>Progress</span>
                <span>{currentStep + 1} / {demoSteps.length}</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <motion.div
                  className="bg-primary-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Demo Steps */}
            <div className="space-y-3">
              {demoSteps.map((step, index) => {
                const status = getStepStatus(index)
                return (
                  <motion.div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                      status === 'active' ? 'border-primary-200 bg-primary-50' : 'border-secondary-200'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
                      {status === 'active' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          {step.icon}
                        </motion.div>
                      ) : (
                        step.icon
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-secondary-900">{step.title}</div>
                      <div className="text-sm text-secondary-600">{step.description}</div>
                    </div>
                    
                    {status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-success-600" />
                    )}
                    {status === 'active' && (
                      <motion.div
                        className="w-2 h-2 bg-primary-600 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Demo Status */}
            <div className="mt-4 pt-4 border-t border-secondary-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">Demo Status</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isRunning ? 'bg-primary-500 animate-pulse' : 'bg-secondary-400'
                  }`} />
                  <span className="font-medium">
                    {isRunning ? 'Running Demo...' : 'Demo Complete'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
