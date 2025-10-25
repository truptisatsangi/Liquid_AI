import { NextResponse } from 'next/server'

interface PortfolioAllocation {
  poolName: string
  currentAllocation: number
  targetAllocation: number
  newAllocation: number
  change: number
  color: string
  tvl: number
  apr: number
  volatility: number
}

interface PortfolioMetrics {
  totalTVL: number
  averageAPR: number
  portfolioVolatility: number
  riskScore: number
  lastRebalance: string
  nextRebalance: string
}

// Simulate realistic portfolio data
const generatePortfolioData = () => {
  const baseTime = Date.now()
  
  // Simulate market variations
  const marketVariation = Math.sin(baseTime / 10000) * 0.1 // Slow oscillation
  const volatilitySpike = Math.random() > 0.8 ? 0.2 : 0 // Occasional spikes
  
  const allocations: PortfolioAllocation[] = [
    {
      poolName: 'ETH/USDC',
      currentAllocation: 35 + marketVariation * 5,
      targetAllocation: 30,
      newAllocation: 30,
      change: -5,
      color: '#3b82f6',
      tvl: 2500000 + Math.random() * 100000,
      apr: 4.9 + Math.random() * 0.2,
      volatility: 18.5 + volatilitySpike * 10
    },
    {
      poolName: 'BTC/USDT',
      currentAllocation: 25 + marketVariation * 3,
      targetAllocation: 20,
      newAllocation: 20,
      change: -5,
      color: '#f59e0b',
      tvl: 1800000 + Math.random() * 80000,
      apr: 4.5 + Math.random() * 0.3,
      volatility: 22.1 + volatilitySpike * 15
    },
    {
      poolName: 'USDC/DAI',
      currentAllocation: 40 + marketVariation * 8,
      targetAllocation: 50,
      newAllocation: 50,
      change: 10,
      color: '#10b981',
      tvl: 3200000 + Math.random() * 120000,
      apr: 2.1 + Math.random() * 0.1,
      volatility: 0.8 + volatilitySpike * 2
    }
  ]

  const metrics: PortfolioMetrics = {
    totalTVL: allocations.reduce((sum, pool) => sum + pool.tvl, 0),
    averageAPR: allocations.reduce((sum, pool) => sum + pool.apr, 0) / allocations.length,
    portfolioVolatility: allocations.reduce((sum, pool) => sum + pool.volatility, 0) / allocations.length,
    riskScore: 6.2 + marketVariation * 2,
    lastRebalance: new Date(baseTime - Math.random() * 3600000).toISOString(), // Last hour
    nextRebalance: new Date(baseTime + Math.random() * 1800000).toISOString() // Next 30 minutes
  }

  return { allocations, metrics }
}

export async function GET() {
  try {
    const portfolioData = generatePortfolioData()
    
    return NextResponse.json({
      success: true,
      data: portfolioData,
      timestamp: new Date().toISOString(),
      source: 'LiquidAI Portfolio Simulator'
    })
  } catch (error) {
    console.error('Error generating portfolio data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate portfolio data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
