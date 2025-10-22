'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, MoreHorizontal, ExternalLink, Activity } from 'lucide-react'
import ProgressRing from './ProgressRing'

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

interface PoolTableProps {
  pools: PoolData[]
}

export default function PoolTable({ pools }: PoolTableProps) {
  const [sortBy, setSortBy] = useState<keyof PoolData>('tvlUSD')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (column: keyof PoolData) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const sortedPools = [...pools].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    }
    
    return sortOrder === 'asc' 
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal))
  })

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Activity className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-secondary-900">Pool Performance</h2>
            <p className="text-sm text-secondary-600">Real-time DEX pool analytics</p>
          </div>
        </div>
        <button className="btn btn-secondary text-sm">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary-200">
              <th 
                className="text-left py-3 px-4 font-medium text-secondary-600 cursor-pointer hover:text-secondary-900"
                onClick={() => handleSort('poolName')}
              >
                Pool
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-secondary-600 cursor-pointer hover:text-secondary-900"
                onClick={() => handleSort('tvlUSD')}
              >
                TVL
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-secondary-600 cursor-pointer hover:text-secondary-900"
                onClick={() => handleSort('volume24h')}
              >
                24h Volume
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-secondary-600 cursor-pointer hover:text-secondary-900"
                onClick={() => handleSort('feeAPR')}
              >
                APR
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-secondary-600 cursor-pointer hover:text-secondary-900"
                onClick={() => handleSort('allocation')}
              >
                Allocation
              </th>
              <th 
                className="text-right py-3 px-4 font-medium text-secondary-600 cursor-pointer hover:text-secondary-900"
                onClick={() => handleSort('priceChange24h')}
              >
                24h Change
              </th>
              <th className="text-center py-3 px-4 font-medium text-secondary-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPools.map((pool, index) => (
              <tr 
                key={pool.id} 
                className="border-b border-secondary-100 hover:bg-secondary-50"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                      {pool.poolName.split('/')[0].slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-secondary-900">{pool.poolName}</div>
                      <div className="text-sm text-secondary-500 font-mono">{pool.poolAddress}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="font-medium text-secondary-900">
                    {formatCurrency(pool.tvlUSD)}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="font-medium text-secondary-900">
                    {formatCurrency(pool.volume24h)}
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <ProgressRing
                      value={pool.feeAPR * 100}
                      max={10}
                      size={32}
                      strokeWidth={3}
                      color="#22c55e"
                      backgroundColor="#e2e8f0"
                      showValue={false}
                    />
                    <div className="font-medium text-success-600">
                      {formatPercentage(pool.feeAPR)}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <ProgressRing
                      value={pool.allocation}
                      max={100}
                      size={32}
                      strokeWidth={3}
                      color="#3b82f6"
                      backgroundColor="#e2e8f0"
                      showValue={false}
                    />
                    <span className="text-sm font-medium text-secondary-600">
                      {pool.allocation}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className={`flex items-center justify-end gap-1 ${
                      pool.priceChange24h >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                    {pool.priceChange24h >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {formatPercentage(Math.abs(pool.priceChange24h))}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <button className="p-1 text-secondary-400 hover:text-secondary-600 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-4 border-t border-secondary-200">
        <div className="flex items-center justify-between text-sm text-secondary-600">
          <span>Showing {pools.length} pools</span>
          <div className="flex items-center gap-4">
            <span>Total TVL: {formatCurrency(pools.reduce((sum, pool) => sum + pool.tvlUSD, 0))}</span>
            <span>Avg APR: {formatPercentage(pools.reduce((sum, pool) => sum + pool.feeAPR, 0) / pools.length)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
