'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Loader2, Sparkles, RefreshCw, TrendingUp } from 'lucide-react'
import MeTTaReasoner, { PoolData, MarketMetrics, ChatContext, ReasoningResult } from '../../lib/mettaReasoner'
import ReasoningCard from './ReasoningCard'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  reasoning?: ReasoningResult
}

interface ChatAgentProps {
  className?: string
}

export default function ChatAgent({ className = '' }: ChatAgentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m LiquidAI, your autonomous liquidity orchestrator. I can help you analyze pool performance, assess market conditions, and optimize your portfolio allocation. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [portfolioSummary, setPortfolioSummary] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data - in production, this would come from APIs
  const [pools, setPools] = useState<PoolData[]>([
    { id: '1', name: 'ETH/USDC', apr: 4.9, tvl: 2500000, volume24h: 1200000, volatility: 18.5, allocation: 35 },
    { id: '2', name: 'BTC/USDT', apr: 4.5, tvl: 1800000, volume24h: 980000, volatility: 22.1, allocation: 25 },
    { id: '3', name: 'USDC/DAI', apr: 2.1, tvl: 3200000, volume24h: 2100000, volatility: 0.8, allocation: 20 },
    { id: '4', name: 'ETH/BTC', apr: 3.8, tvl: 1500000, volume24h: 750000, volatility: 15.2, allocation: 20 }
  ])

  const [marketMetrics, setMarketMetrics] = useState<MarketMetrics>({
    totalVolatility: 18.2,
    averageAPR: 3.8,
    totalTVL: 9000000,
    marketTrend: 'neutral'
  })

  // Create chat context
  const chatContext: ChatContext = {
    previousMessages: messages.map(m => m.content),
    currentPortfolio: pools,
    marketMetrics,
    lastRebalance: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    userPreferences: {
      riskTolerance: 'medium',
      timeHorizon: 'medium'
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Generate portfolio summary
  useEffect(() => {
    const reasoner = new MeTTaReasoner(chatContext)
    setPortfolioSummary(reasoner.generatePortfolioSummary())
  }, [pools, marketMetrics])

  const refreshData = useCallback(async () => {
    setIsRefreshing(true)
    
    try {
      // Fetch pools data from API
      const poolsResponse = await fetch('/api/pools')
      if (poolsResponse.ok) {
        const poolsData = await poolsResponse.json()
        if (poolsData.success) {
          setPools(poolsData.data)
        }
      }
      
      // Fetch metrics data from API
      const metricsResponse = await fetch('/api/metrics')
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        if (metricsData.success) {
          setMarketMetrics(metricsData.data)
        }
      }
      
    } catch (error) {
      console.error('Failed to refresh data:', error)
      // Fallback to mock data updates if API fails
      setPools(prev => prev.map(pool => ({
        ...pool,
        apr: pool.apr + (Math.random() - 0.5) * 0.2,
        volatility: Math.max(0.1, pool.volatility + (Math.random() - 0.5) * 2),
        tvl: pool.tvl + (Math.random() - 0.5) * 100000
      })))
      
      setMarketMetrics(prev => ({
        ...prev,
        totalVolatility: Math.max(5, prev.totalVolatility + (Math.random() - 0.5) * 3),
        averageAPR: prev.averageAPR + (Math.random() - 0.5) * 0.1
      }))
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Use MeTTa reasoner to analyze the query
      const reasoner = new MeTTaReasoner(chatContext)
      const reasoning = reasoner.analyzeQuery(input)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: reasoning.explanation,
        timestamp: new Date(),
        reasoning
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const suggestedQueries = [
    'Which pool has the highest APR?',
    'What\'s the current market volatility?',
    'Should I rebalance my portfolio?',
    'Show me my portfolio status',
    'What are the market conditions?',
    'Yes, go ahead with rebalancing'
  ]

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Bot className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">Ask LiquidAI</h2>
            <p className="text-sm text-secondary-600">AI-powered liquidity management</p>
          </div>
        </div>
        
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="btn btn-secondary text-sm flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Portfolio Summary */}
      {portfolioSummary && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Live Portfolio Status</span>
          </div>
          <p className="text-sm text-blue-700">{portfolioSummary}</p>
        </div>
      )}

      {/* Messages */}
      <div className="h-80 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.type === 'assistant' && (
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-600" />
              </div>
            )}
            
            <div className="max-w-xs lg:max-w-md">
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-primary-100' : 'text-secondary-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
              
              {/* Reasoning Card for assistant messages */}
              {message.type === 'assistant' && message.reasoning && (
                <div className="mt-2">
                  <ReasoningCard reasoning={message.reasoning} compact={true} />
                </div>
              )}
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-secondary-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-600" />
            </div>
            <div className="bg-secondary-100 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-secondary-600" />
                <span className="text-sm text-secondary-600">LiquidAI is analyzing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about pools, volatility, rebalancing, or market conditions..."
          className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="btn btn-primary flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-secondary-200">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-secondary-700">Quick Questions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedQueries.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="px-3 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full hover:bg-secondary-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
