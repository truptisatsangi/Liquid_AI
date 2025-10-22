'use client'

import { useState } from 'react'
import { Brain, Settings, Wallet, Bell } from 'lucide-react'

export default function Header() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        setWalletAddress(accounts[0])
        setIsConnected(true)
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary-900">LiquidAI</h1>
              <p className="text-xs text-secondary-500">Autonomous Liquidity Orchestrator</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-secondary-600 hover:text-primary-600 transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-secondary-600 hover:text-primary-600 transition-colors">
              Pools
            </a>
            <a href="#" className="text-secondary-600 hover:text-primary-600 transition-colors">
              Analytics
            </a>
            <a href="#" className="text-secondary-600 hover:text-primary-600 transition-colors">
              History
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-success-50 border border-success-200 rounded-lg">
                <Wallet className="w-4 h-4 text-success-600" />
                <span className="text-sm font-medium text-success-700">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn btn-primary flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
