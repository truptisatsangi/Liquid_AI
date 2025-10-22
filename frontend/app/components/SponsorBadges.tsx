'use client'

// import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface SponsorBadgeProps {
  name: string
  logo: string
  description: string
  color: string
}

const sponsors: SponsorBadgeProps[] = [
  {
    name: 'ASI',
    logo: '🤖',
    description: 'ASI: Multi-agent orchestration and intent-based execution',
    color: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Envio',
    logo: '📊',
    description: 'Envio: Real-time DEX data indexer and GraphQL API',
    color: 'from-purple-500 to-purple-600'
  },
  {
    name: 'Pyth',
    logo: '🔮',
    description: 'Pyth: Live price oracle and volatility feeds',
    color: 'from-green-500 to-green-600'
  }
]

export default function SponsorBadges() {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-center gap-6 py-4">
        <span className="text-sm text-secondary-500 font-medium">Powered by</span>
        
        <div className="flex items-center gap-4">
          {sponsors.map((sponsor, index) => (
            <Tooltip key={sponsor.name}>
              <TooltipTrigger asChild>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${sponsor.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
                >
                  <span className="text-lg">{sponsor.logo}</span>
                  <span className="font-semibold text-sm">{sponsor.name}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{sponsor.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}
