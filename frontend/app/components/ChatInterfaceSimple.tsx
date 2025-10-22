'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles, Brain, Zap } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  reasoning?: {
    rule: string
    confidence: number
    action: string
  }
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m LiquidAI, your autonomous liquidity orchestrator. I can help you understand market conditions, explain rebalancing strategies, and answer questions about your portfolio. How can I assist you today?',
      timestamp: new Date(),
      reasoning: {
        rule: 'greeting_initiated',
        confidence: 1.0,
        action: 'welcome_user'
      }
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestedQueries = [
    'What\'s the current market volatility?',
    'Should I rebalance my portfolio?',
    'Which pools have the highest APR?',
    'Explain the latest rebalancing decision',
    'Why did APR drop in ETH/USDC?',
    'What\'s my current pool distribution?'
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
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

    // Simulate AI response with reasoning
    setTimeout(() => {
      const responses = [
        {
          content: 'Based on current market conditions, I recommend maintaining a balanced allocation across high-yield pools while reducing exposure to volatile assets.',
          reasoning: {
            rule: 'volatility_high → rebalance_to_stables',
            confidence: 0.87,
            action: 'suggest_rebalance'
          }
        },
        {
          content: 'The current volatility levels suggest implementing a risk-reduction strategy. I\'ve identified 3 pools that could benefit from rebalancing.',
          reasoning: {
            rule: 'risk_threshold_exceeded → reduce_exposure',
            confidence: 0.92,
            action: 'analyze_pools'
          }
        },
        {
          content: 'Your portfolio is performing well with an average APR of 4.5%. The ETH/USDC pool is showing strong volume and could handle increased allocation.',
          reasoning: {
            rule: 'high_volume + stable_apr → increase_allocation',
            confidence: 0.78,
            action: 'optimize_yield'
          }
        },
        {
          content: 'I\'ve analyzed the recent price movements and market sentiment. The data suggests a potential opportunity to optimize yield by reallocating 15% from stable pools to higher-yield opportunities.',
          reasoning: {
            rule: 'market_sentiment_positive → yield_optimization',
            confidence: 0.85,
            action: 'reallocate_15_percent'
          }
        },
        {
          content: 'The MeTTa reasoning engine has identified a pattern in the market data that suggests now might be a good time to execute a rebalance. Would you like me to propose a specific allocation strategy?',
          reasoning: {
            rule: 'pattern_detected → propose_strategy',
            confidence: 0.91,
            action: 'generate_proposal'
          }
        },
        {
          content: 'Based on the Pyth price feeds and Envio indexer data, I can see that volatility has increased by 12% over the past 24 hours. This typically indicates a good time to rebalance for risk management.',
          reasoning: {
            rule: 'volatility_spike_12_percent → risk_management',
            confidence: 0.88,
            action: 'execute_risk_rebalance'
          }
        },
        {
          content: 'I\'ve processed the latest market data and my confidence level for the next rebalancing opportunity is 87%. The Observer Agent has detected some interesting patterns in the pool metrics.',
          reasoning: {
            rule: 'confidence_high + patterns_detected → ready_for_action',
            confidence: 0.87,
            action: 'prepare_execution'
          }
        }
      ]

      const selectedResponse = responses[Math.floor(Math.random() * responses.length)]
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: selectedResponse.content,
        timestamp: new Date(),
        reasoning: selectedResponse.reasoning
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-50 rounded-lg">
          <Bot className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-secondary-900">Ask LiquidAI</h2>
          <p className="text-sm text-secondary-600">Chat with your AI liquidity manager</p>
        </div>
      </div>

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
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-primary-100' : 'text-secondary-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
              
              {/* Reasoning snippet for assistant messages */}
              {message.type === 'assistant' && message.reasoning && (
                <div className="mt-2 bg-gray-900 p-3 rounded-lg text-xs text-gray-300 font-mono">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-3 h-3 text-blue-400" />
                    <span className="text-blue-400 font-semibold">MeTTa Reasoning</span>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <span className="text-gray-400">Rule:</span> 
                      <span className="text-yellow-300 ml-1">{message.reasoning.rule}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Confidence:</span> 
                      <span className="text-green-300 ml-1">{message.reasoning.confidence}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Action:</span> 
                      <span className="text-purple-300 ml-1">{message.reasoning.action}</span>
                    </div>
                  </div>
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
                <span className="text-sm text-secondary-600">LiquidAI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your portfolio, market conditions, or rebalancing strategies..."
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
      <div className="mt-4 pt-4 border-t border-secondary-200">
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
