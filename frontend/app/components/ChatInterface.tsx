'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m LiquidAI, your autonomous liquidity orchestrator. I can help you understand market conditions, explain rebalancing strategies, and answer questions about your portfolio. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Based on current market conditions, I recommend maintaining a balanced allocation across high-yield pools while reducing exposure to volatile assets.',
        'The current volatility levels suggest implementing a risk-reduction strategy. I\'ve identified 3 pools that could benefit from rebalancing.',
        'Your portfolio is performing well with an average APR of 4.5%. The ETH/USDC pool is showing strong volume and could handle increased allocation.',
        'I\'ve analyzed the recent price movements and market sentiment. The data suggests a potential opportunity to optimize yield by reallocating 15% from stable pools to higher-yield opportunities.',
        'The MeTTa reasoning engine has identified a pattern in the market data that suggests now might be a good time to execute a rebalance. Would you like me to propose a specific allocation strategy?',
        'Based on the Pyth price feeds and Envio indexer data, I can see that volatility has increased by 12% over the past 24 hours. This typically indicates a good time to rebalance for risk management.',
        'I\'ve processed the latest market data and my confidence level for the next rebalancing opportunity is 87%. The Observer Agent has detected some interesting patterns in the pool metrics.'
      ]

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
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
            
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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
          placeholder="Ask about market conditions, rebalancing strategies, or portfolio performance..."
          className="input flex-1"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="btn btn-primary px-4"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-secondary-200">
        <div className="flex flex-wrap gap-2">
          {[
            'What\'s the current market volatility?',
            'Should I rebalance my portfolio?',
            'Which pools have the highest APR?',
            'Explain the latest rebalancing decision'
          ].map((suggestion) => (
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
