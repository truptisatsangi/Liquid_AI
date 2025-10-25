export interface PoolData {
  id: string
  name: string
  apr: number
  tvl: number
  volume24h: number
  volatility: number
  allocation: number
}

export interface MarketMetrics {
  totalVolatility: number
  averageAPR: number
  totalTVL: number
  marketTrend: 'bullish' | 'bearish' | 'neutral'
}

export interface ReasoningResult {
  rule: string
  confidence: number
  action: string
  explanation: string
  strategy?: string
}

export interface ChatContext {
  previousMessages: string[]
  currentPortfolio: PoolData[]
  marketMetrics: MarketMetrics
  lastRebalance?: Date
  userPreferences?: {
    riskTolerance: 'low' | 'medium' | 'high'
    timeHorizon: 'short' | 'medium' | 'long'
  }
}

class MeTTaReasoner {
  private context: ChatContext

  constructor(context: ChatContext) {
    this.context = context
  }

  // Rule-based reasoning engine
  analyzeQuery(query: string): ReasoningResult {
    const lowerQuery = query.toLowerCase()
    
    // APR Analysis Rules
    if (lowerQuery.includes('highest apr') || lowerQuery.includes('best apr')) {
      return this.analyzeAPR()
    }
    
    // Volatility Analysis Rules
    if (lowerQuery.includes('volatility') || lowerQuery.includes('risk')) {
      return this.analyzeVolatility()
    }
    
    // Rebalancing Rules
    if (lowerQuery.includes('rebalance') || lowerQuery.includes('reallocate')) {
      return this.analyzeRebalancing()
    }
    
    // Portfolio Status Rules
    if (lowerQuery.includes('portfolio') || lowerQuery.includes('status')) {
      return this.analyzePortfolio()
    }
    
    // Market Conditions Rules
    if (lowerQuery.includes('market') || lowerQuery.includes('condition')) {
      return this.analyzeMarketConditions()
    }
    
    // Default reasoning
    return this.defaultReasoning(query)
  }

  private analyzeAPR(): ReasoningResult {
    const pools = this.context.currentPortfolio
    const sortedPools = [...pools].sort((a, b) => b.apr - a.apr)
    const highestAPR = sortedPools[0]
    const volatility = this.context.marketMetrics.totalVolatility
    
    let rule: string
    let confidence: number
    let action: string
    let explanation: string
    let strategy: string

    if (volatility > 20) {
      rule = 'volatility_high + apr_spread_detected → rebalance_to_stables'
      confidence = 0.89
      action = 'suggest_rebalance'
      explanation = `📊 ${highestAPR.name} has the highest APR at ${highestAPR.apr}%, followed by ${sortedPools[1]?.name} at ${sortedPools[1]?.apr}%. Given current volatility (${volatility}%), you may consider reallocating a portion to stable pools for risk management.`
      strategy = 'Consider 60% high-APR pools, 40% stable pools for optimal risk-adjusted returns.'
    } else {
      rule = 'volatility_low + high_apr_opportunity → maximize_yield'
      confidence = 0.85
      action = 'suggest_yield_optimization'
      explanation = `📊 ${highestAPR.name} has the highest APR at ${highestAPR.apr}%. With low volatility (${volatility}%), this presents a good opportunity for yield optimization.`
      strategy = 'Consider increasing allocation to high-APR pools while maintaining diversification.'
    }

    return { rule, confidence, action, explanation, strategy }
  }

  private analyzeVolatility(): ReasoningResult {
    const volatility = this.context.marketMetrics.totalVolatility
    const pools = this.context.currentPortfolio
    
    let rule: string
    let confidence: number
    let action: string
    let explanation: string
    let strategy: string

    if (volatility > 25) {
      rule = 'volatility_extreme → defensive_positioning'
      confidence = 0.92
      action = 'suggest_defensive_rebalance'
      explanation = `⚠️ Current volatility is ${volatility}%, indicating high market stress. Consider defensive positioning.`
      strategy = 'Reduce exposure to volatile assets, increase stable coin allocations (USDC/DAI).'
    } else if (volatility > 15) {
      rule = 'volatility_elevated → balanced_approach'
      confidence = 0.78
      action = 'suggest_balanced_rebalance'
      explanation = `📈 Volatility is elevated at ${volatility}%. A balanced approach is recommended.`
      strategy = 'Maintain current allocations but monitor closely for rebalancing opportunities.'
    } else {
      rule = 'volatility_low → growth_opportunity'
      confidence = 0.82
      action = 'suggest_growth_positioning'
      explanation = `📊 Low volatility environment (${volatility}%) presents growth opportunities.`
      strategy = 'Consider increasing allocation to higher-yield, higher-risk pools.'
    }

    return { rule, confidence, action, explanation, strategy }
  }

  private analyzeRebalancing(): ReasoningResult {
    const pools = this.context.currentPortfolio
    const volatility = this.context.marketMetrics.totalVolatility
    const avgAPR = this.context.marketMetrics.averageAPR
    
    // Calculate optimal allocation based on volatility and APR
    const highAPRPools = pools.filter(p => p.apr > avgAPR * 1.2)
    const stablePools = pools.filter(p => p.volatility < 10)
    
    let rule: string
    let confidence: number
    let action: string
    let explanation: string
    let strategy: string

    if (volatility > 20) {
      rule = 'volatility_high → conservative_rebalance'
      confidence = 0.91
      action = 'execute_conservative_rebalance'
      explanation = `✅ Preparing a conservative rebalancing proposal: 40% high-APR pools, 60% stable pools. Expected APR: ${(avgAPR * 0.8).toFixed(2)}%, Reduced risk: ${(volatility * 0.7).toFixed(1)}%.`
      strategy = 'Focus on capital preservation with moderate yield.'
    } else {
      rule = 'volatility_moderate → balanced_rebalance'
      confidence = 0.87
      action = 'execute_balanced_rebalance'
      explanation = `✅ Preparing a balanced rebalancing proposal: 60% high-APR pools, 40% stable pools. Expected APR: ${(avgAPR * 1.1).toFixed(2)}%, Risk level: ${volatility}%.`
      strategy = 'Optimize for risk-adjusted returns with growth potential.'
    }

    return { rule, confidence, action, explanation, strategy }
  }

  private analyzePortfolio(): ReasoningResult {
    const pools = this.context.currentPortfolio
    const totalTVL = pools.reduce((sum, pool) => sum + pool.tvl, 0)
    const avgAPR = pools.reduce((sum, pool) => sum + pool.apr, 0) / pools.length
    const maxVolatility = Math.max(...pools.map(p => p.volatility))
    
    const rule = 'portfolio_analysis → status_summary'
    const confidence = 0.95
    const action = 'provide_portfolio_summary'
    const explanation = `📊 Portfolio Status: ${pools.length} pools, Total TVL: $${(totalTVL / 1000000).toFixed(1)}M, Average APR: ${avgAPR.toFixed(2)}%, Max Volatility: ${maxVolatility.toFixed(1)}%`
    const strategy = 'Portfolio is well-diversified. Consider rebalancing if volatility exceeds 20%.'

    return { rule, confidence, action, explanation, strategy }
  }

  private analyzeMarketConditions(): ReasoningResult {
    const metrics = this.context.marketMetrics
    const trend = metrics.marketTrend
    
    let rule: string
    let confidence: number
    let action: string
    let explanation: string
    let strategy: string

    switch (trend) {
      case 'bullish':
        rule = 'market_bullish → growth_positioning'
        confidence = 0.88
        action = 'suggest_growth_strategy'
        explanation = `🚀 Market conditions are bullish. Volatility: ${metrics.totalVolatility}%, Average APR: ${metrics.averageAPR}%`
        strategy = 'Consider increasing allocation to growth-oriented pools.'
        break
      case 'bearish':
        rule = 'market_bearish → defensive_positioning'
        confidence = 0.85
        action = 'suggest_defensive_strategy'
        explanation = `📉 Market conditions are bearish. Volatility: ${metrics.totalVolatility}%, Average APR: ${metrics.averageAPR}%`
        strategy = 'Focus on stable pools and capital preservation.'
        break
      default:
        rule = 'market_neutral → balanced_approach'
        confidence = 0.82
        action = 'suggest_balanced_strategy'
        explanation = `📊 Market conditions are neutral. Volatility: ${metrics.totalVolatility}%, Average APR: ${metrics.averageAPR}%`
        strategy = 'Maintain balanced allocation across different pool types.'
    }

    return { rule, confidence, action, explanation, strategy }
  }

  private defaultReasoning(query: string): ReasoningResult {
    return {
      rule: 'general_query → contextual_response',
      confidence: 0.75,
      action: 'provide_general_guidance',
      explanation: `I understand you're asking about "${query}". Let me analyze the current market conditions and your portfolio to provide the best guidance.`,
      strategy: 'Consider asking specific questions about APR, volatility, or rebalancing for more targeted advice.'
    }
  }

  // Generate portfolio summary
  generatePortfolioSummary(): string {
    const pools = this.context.currentPortfolio
    const totalTVL = pools.reduce((sum, pool) => sum + pool.tvl, 0)
    const avgAPR = pools.reduce((sum, pool) => sum + pool.apr, 0) / pools.length
    const totalVolatility = this.context.marketMetrics.totalVolatility
    
    return `📊 **Portfolio Summary**: ${pools.length} pools | TVL: $${(totalTVL / 1000000).toFixed(1)}M | Avg APR: ${avgAPR.toFixed(2)}% | Volatility: ${totalVolatility.toFixed(1)}%`
  }
}

export default MeTTaReasoner
