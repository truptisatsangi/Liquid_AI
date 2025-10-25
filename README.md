# LiquidAI: AI-Driven Liquidity Orchestration Protocol

## 🎯 **Project Overview**

LiquidAI is an **AI-driven liquidity orchestration protocol** that combines autonomous decision-making with intelligent portfolio management. It leverages MeTTa reasoning, real-time data from Pyth Network and Envio, and provides an interactive dashboard for portfolio management.

## 🚀 **Live Demo**

**Frontend Dashboard**: http://localhost:3000

### **Key Features:**
- ✅ **Real-time Portfolio Rebalancing** with live animations
- ✅ **AI Chat Interface** with MeTTa reasoning
- ✅ **Live Portfolio Tracker** with real-time metrics
- ✅ **Interactive Demo Mode** for complete workflow simulation
- ✅ **Pool Performance Analytics** with sorting and filtering
- ✅ **Agent Status Monitoring** with live indicators

## 🏗️ **Architecture**

### **Core Components:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Layer    │    │   AI Layer      │    │  Frontend       │
│                 │    │                 │    │                 │
│ • Pyth Network  │───▶│ • MeTTa         │───▶│ • Dashboard     │
│ • Envio Indexer │    │ • Reasoning     │    │ • Chat Interface│
│ • DEX APIs      │    │ • Confidence    │    │ • Live Tracking │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Smart Contracts:**
- **`LiquidityVault.sol`** - Core vault for liquidity management
- **OpenZeppelin Integration** - Security and standard compliance

### **AI Agents:**
- **Observer Agent** - Market data collection and analysis
- **Allocator Agent** - Portfolio optimization and strategy generation
- **Executor Agent** - Transaction execution and monitoring

## 🎮 **Demo Features**

### **1. Live Portfolio Rebalancing**
- **Visual portfolio allocation** with animated progress bars
- **Step-by-step rebalancing process** (6 steps)
- **MeTTa reasoning display** in real-time
- **Interactive controls** to start/stop rebalancing

### **2. AI Chat Interface**
- **Conversational AI** with context awareness
- **MeTTa reasoning cards** showing decision logic
- **Auto-suggestions** for common queries
- **Portfolio summary** with live data

### **3. Live Portfolio Tracker**
- **Real-time metrics** updating every 3 seconds
- **Live events feed** showing AI actions
- **Performance tracking** with trend indicators
- **Interactive rebalancing triggers**

## 🔧 **Quick Start**

### **1. Install Dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### **2. Start the Demo**
```bash
# Start the frontend
cd frontend
npm run dev

# Open http://localhost:3000
```

### **3. Try the Demo**
1. **Live Rebalancing**: Click "Start Rebalancing" to see AI in action
2. **Portfolio Tracker**: Click "Start Tracking" for live metrics
3. **AI Chat**: Ask questions about your portfolio
4. **Demo Mode**: Run the complete workflow simulation

## 📊 **Real-Time Data**

### **APIs:**
- **`/api/pools`** - Pool performance data
- **`/api/metrics`** - Market metrics and volatility
- **`/api/portfolio`** - Live portfolio allocations
- **`/api/rebalancing`** - Rebalancing process simulation

### **Data Sources:**
- **Pyth Network** - Real-time price feeds
- **Envio HyperIndex** - DEX pool metrics
- **Uniswap V3** - Pool data and analytics

## 🧠 **AI Reasoning (MeTTa)**

### **Rule-Based Logic:**
```typescript
// High Volatility Rule
if (volatility > 20%) {
  rule: 'volatility_high → rebalance_to_stables'
  confidence: 0.89
  action: 'suggest_rebalance'
}

// Yield Optimization Rule
if (apr_spread > 2% && volatility < 15%) {
  rule: 'yield_opportunity_detected → maximize_returns'
  confidence: 0.85
  action: 'suggest_yield_optimization'
}
```

### **Reasoning Display:**
- **Rule explanations** (e.g., "volatility_high → rebalance_to_stables")
- **Confidence scores** (0-1 scale)
- **Action descriptions** (e.g., "execute_rebalance")
- **Strategy suggestions** with explanations

## 🎯 **Demo Scenarios**

### **Scenario 1: Live Rebalancing**
```
1. AI detects market volatility spike (18% → 25%)
2. MeTTa generates proposal: Move 10% to stable pools
3. User reviews proposal with confidence and reasoning
4. User approves the rebalancing
5. System executes with real-time progress tracking
6. Portfolio allocations update with animations
```

### **Scenario 2: AI Chat Interaction**
```
User: "Which pool has the highest APR?"
AI: "📊 ETH/USDC has the highest APR at 4.9%, followed by BTC/USDT at 4.5%.
     Given current volatility (18%), you may consider reallocating a portion to USDC/DAI for stability.

🧠 MeTTa Reasoning
Rule: volatility_high + apr_spread_detected → rebalance_to_stables
Confidence: 0.89
Action: suggest_rebalance"
```

### **Scenario 3: Live Metrics Tracking**
```
1. Start live tracking
2. Watch metrics update every 3 seconds:
   - Total Value Locked: $7.6M → $7.8M
   - Average APR: 4.8% → 4.9%
   - Portfolio Volatility: 18.5% → 15.2%
   - Risk Score: 6.2 → 5.8
3. Trigger rebalancing to see AI in action
4. Monitor live events feed
```

## 🛠️ **Technical Stack**

### **Frontend:**
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### **Smart Contracts:**
- **Solidity 0.8.24** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Security libraries

### **AI & Data:**
- **MeTTa Reasoning** - AI decision engine
- **Pyth Network** - Price feeds
- **Envio HyperIndex** - Data indexing
- **Node.js** - AI agent orchestration

## 📁 **Project Structure**

```
Liquid_AI/
├── contracts/                 # Smart contracts
│   └── LiquidityVault.sol
├── frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── components/       # React components
│   │   ├── api/             # API routes
│   │   └── page.tsx         # Main dashboard
│   └── lib/
│       └── mettaReasoner.ts  # AI reasoning engine
├── agents/                   # AI agents
│   ├── observer-agent.js
│   ├── allocator-agent.js
│   └── executor-agent.js
├── indexer/                  # Envio indexer
│   ├── schema.graphql
│   └── src/handlers/
├── scripts/                  # Deployment scripts
│   ├── deploy.js
│   ├── pyth-pull.js
│   └── pyth-update.js
└── README.md
```

## 🎉 **Key Highlights**

### **Real-Time Features:**
- ✅ **Live portfolio rebalancing** with smooth animations
- ✅ **Real-time metrics** updating every 3 seconds
- ✅ **Interactive AI chat** with MeTTa reasoning
- ✅ **Step-by-step process** visualization
- ✅ **Live events feed** showing AI actions

### **AI Capabilities:**
- 🧠 **MeTTa reasoning** with confidence scoring
- 📊 **Market analysis** and volatility detection
- 🎯 **Portfolio optimization** strategies
- 💡 **Intelligent recommendations** with explanations

### **User Experience:**
- 🎮 **Interactive controls** for all features
- 📱 **Responsive design** for all devices
- 🎨 **Beautiful animations** and transitions
- 📈 **Real-time data** visualization

## 🚀 **Getting Started**

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Start frontend**: `cd frontend && npm run dev`
4. **Open dashboard**: http://localhost:3000
5. **Try the demo**: Click "Start Rebalancing" to see AI in action!

## 📝 **Documentation**

- **`explain.md`** - Complete system explanation
- **`REAL_TIME_DEMO_EXPLANATION.md`** - Demo usage guide
- **API Documentation** - Available in `/api` routes

## 🏆 **Built for ETHOnline 2025**

LiquidAI demonstrates the future of AI-driven DeFi portfolio management, combining:
- **Autonomous decision-making** with human oversight
- **Real-time data processing** from multiple sources
- **Intelligent reasoning** with explainable AI
- **Interactive user experience** for portfolio management

**Experience the future of DeFi portfolio management with LiquidAI!** 🚀