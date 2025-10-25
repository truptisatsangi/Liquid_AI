import { NextResponse } from 'next/server'
import { PoolData } from '../../../../lib/mettaReasoner'

// Mock pool data - in production, this would fetch from your database or external APIs
const mockPools: PoolData[] = [
  {
    id: '1',
    name: 'ETH/USDC',
    apr: 4.9 + (Math.random() - 0.5) * 0.4, // Add some variation
    tvl: 2500000 + (Math.random() - 0.5) * 200000,
    volume24h: 1200000 + (Math.random() - 0.5) * 100000,
    volatility: 18.5 + (Math.random() - 0.5) * 3,
    allocation: 35
  },
  {
    id: '2',
    name: 'BTC/USDT',
    apr: 4.5 + (Math.random() - 0.5) * 0.4,
    tvl: 1800000 + (Math.random() - 0.5) * 150000,
    volume24h: 980000 + (Math.random() - 0.5) * 80000,
    volatility: 22.1 + (Math.random() - 0.5) * 4,
    allocation: 25
  },
  {
    id: '3',
    name: 'USDC/DAI',
    apr: 2.1 + (Math.random() - 0.5) * 0.2,
    tvl: 3200000 + (Math.random() - 0.5) * 250000,
    volume24h: 2100000 + (Math.random() - 0.5) * 150000,
    volatility: 0.8 + (Math.random() - 0.5) * 0.5,
    allocation: 20
  },
  {
    id: '4',
    name: 'ETH/BTC',
    apr: 3.8 + (Math.random() - 0.5) * 0.3,
    tvl: 1500000 + (Math.random() - 0.5) * 120000,
    volume24h: 750000 + (Math.random() - 0.5) * 60000,
    volatility: 15.2 + (Math.random() - 0.5) * 2.5,
    allocation: 20
  },
  {
    id: '5',
    name: 'LINK/ETH',
    apr: 5.2 + (Math.random() - 0.5) * 0.5,
    tvl: 800000 + (Math.random() - 0.5) * 80000,
    volume24h: 450000 + (Math.random() - 0.5) * 40000,
    volatility: 25.8 + (Math.random() - 0.5) * 5,
    allocation: 15
  },
  {
    id: '6',
    name: 'UNI/USDC',
    apr: 3.2 + (Math.random() - 0.5) * 0.3,
    tvl: 1200000 + (Math.random() - 0.5) * 100000,
    volume24h: 680000 + (Math.random() - 0.5) * 50000,
    volatility: 19.5 + (Math.random() - 0.5) * 3.5,
    allocation: 18
  }
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // In production, you would:
    // 1. Fetch from your database
    // 2. Call external APIs (Uniswap, SushiSwap, etc.)
    // 3. Calculate real-time metrics
    
    return NextResponse.json({
      success: true,
      data: mockPools,
      timestamp: new Date().toISOString(),
      source: 'LiquidAI Pool Indexer'
    })
  } catch (error) {
    console.error('Error fetching pools:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch pool data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
