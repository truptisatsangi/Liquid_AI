import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LiquidAI - Autonomous Liquidity Orchestrator',
  description: 'AI-driven liquidity management protocol for ETHOnline 2025',
  keywords: ['DeFi', 'Liquidity', 'AI', 'Ethereum', 'DEX', 'Automation'],
  authors: [{ name: 'LiquidAI Team' }],
  openGraph: {
    title: 'LiquidAI - Autonomous Liquidity Orchestrator',
    description: 'AI-driven liquidity management protocol for ETHOnline 2025',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LiquidAI - Autonomous Liquidity Orchestrator',
    description: 'AI-driven liquidity management protocol for ETHOnline 2025',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
          {children}
        </div>
      </body>
    </html>
  )
}
