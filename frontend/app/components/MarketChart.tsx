'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, BarChart3 } from 'lucide-react'

export default function MarketChart() {
  const [chartType, setChartType] = useState<'tvl' | 'volume'>('tvl')
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d')
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Generate mock data based on time range
    const generateData = () => {
      const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30
      const interval = timeRange === '24h' ? 1 : 1 // hours vs days
      
      return Array.from({ length: points }, (_, i) => {
        const baseValue = chartType === 'tvl' ? 3000000 : 150000
        const variation = (Math.random() - 0.5) * 0.2
        const trend = Math.sin(i / points * Math.PI * 2) * 0.1
        
        return {
          time: timeRange === '24h' 
            ? `${i}:00` 
            : timeRange === '7d' 
            ? `Day ${i + 1}`
            : `Week ${i + 1}`,
          value: baseValue * (1 + variation + trend),
          volume: chartType === 'volume' ? baseValue * (1 + variation + trend) : undefined,
          tvl: chartType === 'tvl' ? baseValue * (1 + variation + trend) : undefined
        }
      })
    }

    setData(generateData())
  }, [chartType, timeRange])

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-secondary-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-secondary-900">{label}</p>
          <p className="text-sm text-primary-600">
            {chartType === 'tvl' ? 'TVL' : 'Volume'}: {formatValue(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            {chartType === 'tvl' ? (
              <TrendingUp className="w-5 h-5 text-primary-600" />
            ) : (
              <BarChart3 className="w-5 h-5 text-primary-600" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary-900">
              {chartType === 'tvl' ? 'Total Value Locked' : 'Trading Volume'}
            </h2>
            <p className="text-sm text-secondary-600">Market performance over time</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Chart Type Toggle */}
          <div className="flex bg-secondary-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('tvl')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartType === 'tvl'
                  ? 'bg-white text-secondary-900 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              TVL
            </button>
            <button
              onClick={() => setChartType('volume')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                chartType === 'volume'
                  ? 'bg-white text-secondary-900 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Volume
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex bg-secondary-100 rounded-lg p-1">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-secondary-900 shadow-sm'
                    : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={chartType === 'tvl' ? 'tvl' : 'volume'}
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Stats */}
      <div className="mt-6 pt-4 border-t border-secondary-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-secondary-900">
              {formatValue(data[data.length - 1]?.value || 0)}
            </div>
            <div className="text-xs text-secondary-600">Current</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-success-600">
              +{((data[data.length - 1]?.value - data[0]?.value) / data[0]?.value * 100 || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-secondary-600">Change</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-secondary-900">
              {formatValue(data.reduce((sum, d) => sum + d.value, 0) / data.length || 0)}
            </div>
            <div className="text-xs text-secondary-600">Average</div>
          </div>
        </div>
      </div>
    </div>
  )
}
