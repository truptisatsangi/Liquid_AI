'use client'

import { useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Zap, 
  BarChart3, 
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Play,
  Pause,
  Settings
} from 'lucide-react'
import { Toaster, toast } from 'react-hot-toast'
import Header from './components/Header'
import MetricCard from './components/MetricCard'
import PoolTable from './components/PoolTableSimple'
import RebalanceHistory from './components/RebalanceHistory'
import MarketChart from './components/MarketChart'
import AgentStatus from './components/AgentStatusSimple'
import ChatInterface from './components/ChatInterfaceSimple'
import SponsorBadges from './components/SponsorBadges'
import DataFreshness from './components/DataFreshness'
import DemoModeSwitch from './components/DemoModeSwitchSimple'
import UnderTheHoodModal from './components/UnderTheHoodModalSimple'

interface PoolData {
  id: string
  poolAddress: string
  poolName: string
  tvlUSD: number
  volume24h: number
  feeAPR: number
  volatility: number
  allocation: number
  priceChange24h: number
}

interface MarketData {
  totalTVL: number
  averageAPR: number
  marketVolatility: number
  activePools: number
  totalVolume24h: number
}

export default function Dashboard() {
  const [marketData, setMarketData] = useState<MarketData>({
    totalTVL: 0,
    averageAPR: 0,
    marketVolatility: 0,
    activePools: 0,
    totalVolume24h: 0
  })
  
  const [pools, setPools] = useState<PoolData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAgentRunning, setIsAgentRunning] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isUpdating, setIsUpdating] = useState(false)
  const [showUnderTheHood, setShowUnderTheHood] = useState(false)

  // Mock data for development
  useEffect(() => {
    const loadMockData = () => {
      setMarketData({
        totalTVL: 3250000,
        averageAPR: 0.045,
        marketVolatility: 0.18,
        activePools: 8,
        totalVolume24h: 125000
      })
      
      setPools([
        {
          id: '1',
          poolAddress: '0x1234...7890',
          poolName: 'ETH/USDC',
          tvlUSD: 1200000,
          volume24h: 45000,
          feeAPR: 0.052,
          volatility: 0.15,
          allocation: 35,
          priceChange24h: 0.023
        },
        {
          id: '2',
          poolAddress: '0x2345...8901',
          poolName: 'BTC/USDC',
          tvlUSD: 950000,
          volume24h: 38000,
          feeAPR: 0.041,
          volatility: 0.12,
          allocation: 28,
          priceChange24h: -0.008
        },
        {
          id: '3',
          poolAddress: '0x3456...9012',
          poolName: 'ETH/BTC',
          tvlUSD: 750000,
          volume24h: 25000,
          feeAPR: 0.038,
          volatility: 0.22,
          allocation: 22,
          priceChange24h: 0.015
        },
        {
          id: '4',
          poolAddress: '0x4567...0123',
          poolName: 'USDC/USDT',
          tvlUSD: 350000,
          volume24h: 17000,
          feeAPR: 0.012,
          volatility: 0.02,
          allocation: 15,
          priceChange24h: 0.001
        }
      ])
      
      setIsLoading(false)
      setLastUpdate(new Date())
    }

    loadMockData()
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setPools(prevPools => 
        prevPools.map(pool => ({
          ...pool,
          tvlUSD: pool.tvlUSD * (1 + (Math.random() - 0.5) * 0.02),
          volume24h: pool.volume24h * (1 + (Math.random() - 0.5) * 0.05),
          priceChange24h: (Math.random() - 0.5) * 0.1
        }))
      )
      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handleExecuteRebalance = async () => {
    setIsUpdating(true)
    toast.loading('Executing rebalance...', { id: 'rebalance' })
    
    // Simulate rebalance execution
    setTimeout(() => {
      toast.success('Rebalance executed successfully!', { id: 'rebalance' })
      setIsUpdating(false)
      setLastUpdate(new Date())
    }, 2000)
  }

  const toggleAgent = () => {
    setIsAgentRunning(!isAgentRunning)
    toast.success(isAgentRunning ? 'Agent stopped' : 'Agent started')
  }

  const handleRefreshData = () => {
    setIsUpdating(true)
    toast.loading('Refreshing data...', { id: 'refresh' })
    
    setTimeout(() => {
      setLastUpdate(new Date())
      setIsUpdating(false)
      toast.success('Data refreshed successfully!', { id: 'refresh' })
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Sponsor Badges */}
        <SponsorBadges />
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            LiquidAI Dashboard
          </h1>
          <p className="text-xl text-secondary-600 mb-8">
            Autonomous Liquidity Orchestration Protocol
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={toggleAgent}
              className={`btn ${isAgentRunning ? 'btn-danger' : 'btn-success'} flex items-center gap-2`}
            >
              {isAgentRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isAgentRunning ? 'Stop Agent' : 'Start Agent'}
            </button>
            
            <button
              onClick={handleExecuteRebalance}
              className="btn btn-primary flex items-center gap-2"
              disabled={isUpdating}
            >
              <Zap className="w-4 h-4" />
              Execute Rebalance
            </button>
            
            <button 
              onClick={handleRefreshData}
              className="btn btn-secondary flex items-center gap-2"
              disabled={isUpdating}
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
            
            <button 
              onClick={() => setShowUnderTheHood(true)}
              className="btn btn-outline flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Under the Hood
            </button>
          </div>
          
          <DataFreshness lastUpdate={lastUpdate} isUpdating={isUpdating} />
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total TVL"
            value={`$${(marketData.totalTVL / 1000000).toFixed(2)}M`}
            change={2.3}
            icon={<DollarSign className="w-6 h-6" />}
            color="primary"
            description="Total Value Locked across all monitored DEX pools, updated via Envio HyperIndex"
            isUpdating={isUpdating}
            index={0}
          />
          <MetricCard
            title="Average APR"
            value={`${(marketData.averageAPR * 100).toFixed(2)}%`}
            change={0.8}
            icon={<TrendingUp className="w-6 h-6" />}
            color="success"
            description="Average Annual Percentage Rate across all pools, calculated from fee data"
            isUpdating={isUpdating}
            index={1}
          />
          <MetricCard
            title="Market Volatility"
            value={`${(marketData.marketVolatility * 100).toFixed(1)}%`}
            change={-1.2}
            icon={<Activity className="w-6 h-6" />}
            color="warning"
            description="Real-time volatility calculated from Pyth price feeds and market movements"
            isUpdating={isUpdating}
            index={2}
          />
          <MetricCard
            title="Active Pools"
            value={marketData.activePools.toString()}
            change={0}
            icon={<BarChart3 className="w-6 h-6" />}
            color="info"
            description="Number of DEX pools currently being monitored and managed by LiquidAI"
            isUpdating={isUpdating}
            index={3}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Pool Table */}
          <div className="lg:col-span-2">
            <PoolTable pools={pools} />
          </div>
          
          {/* Agent Status */}
          <div>
            <AgentStatus isRunning={isAgentRunning} />
          </div>
        </div>

        {/* Charts and History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <MarketChart />
          <RebalanceHistory />
        </div>

        {/* Demo Mode and Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <DemoModeSwitch />
          <ChatInterface />
        </div>
      </main>

      {/* Under the Hood Modal */}
      <UnderTheHoodModal 
        isOpen={showUnderTheHood} 
        onClose={() => setShowUnderTheHood(false)} 
      />
    </div>
  )
}
