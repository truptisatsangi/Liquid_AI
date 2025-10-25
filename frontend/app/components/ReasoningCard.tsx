'use client'

import { Brain, Zap, Target, Lightbulb } from 'lucide-react'
import { ReasoningResult } from '../../lib/mettaReasoner'

interface ReasoningCardProps {
  reasoning: ReasoningResult
  compact?: boolean
}

export default function ReasoningCard({ reasoning, compact = false }: ReasoningCardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return 'High'
    if (confidence >= 0.8) return 'Good'
    if (confidence >= 0.7) return 'Fair'
    return 'Low'
  }

  if (compact) {
    return (
      <div className="bg-gray-900 p-3 rounded-lg text-xs text-gray-300 font-mono">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-3 h-3 text-blue-400" />
          <span className="text-blue-400 font-semibold">MeTTa Reasoning</span>
          <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(reasoning.confidence)}`}>
            {getConfidenceBadge(reasoning.confidence)}
          </div>
        </div>
        <div className="space-y-1">
          <div>
            <span className="text-gray-400">Rule:</span> 
            <span className="text-yellow-300 ml-1">{reasoning.rule}</span>
          </div>
          <div>
            <span className="text-gray-400">Confidence:</span> 
            <span className="text-green-300 ml-1">{reasoning.confidence}</span>
          </div>
          <div>
            <span className="text-gray-400">Action:</span> 
            <span className="text-purple-300 ml-1">{reasoning.action}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-xl border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Brain className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">MeTTa Reasoning Engine</h3>
          <p className="text-sm text-gray-400">AI-driven decision analysis</p>
        </div>
        <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(reasoning.confidence)}`}>
          {getConfidenceBadge(reasoning.confidence)} Confidence
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-gray-300">Rule</span>
          </div>
          <p className="text-sm text-yellow-300 font-mono">{reasoning.rule}</p>
        </div>

        <div className="bg-gray-800/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-gray-300">Confidence</span>
          </div>
          <p className="text-lg font-bold text-green-400">{reasoning.confidence}</p>
        </div>

        <div className="bg-gray-800/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Action</span>
          </div>
          <p className="text-sm text-purple-300 font-mono">{reasoning.action}</p>
        </div>
      </div>

      {reasoning.strategy && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Strategy Suggestion</span>
          </div>
          <p className="text-sm text-blue-200">{reasoning.strategy}</p>
        </div>
      )}
    </div>
  )
}
