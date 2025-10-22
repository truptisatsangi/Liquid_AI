/**
 * LiquidAI Envio API Server
 * Provides GraphQL API for querying indexed DEX pool data
 */

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT || 3001;

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://liquidai.vercel.app'],
  credentials: true
}));

// GraphQL Schema
const schema = buildSchema(`
  type PoolMetric {
    id: ID!
    poolAddress: String!
    poolName: String
    token0: String!
    token1: String!
    token0Symbol: String
    token1Symbol: String
    tvlUSD: Float!
    volume24h: Float!
    volume7d: Float!
    feeAPR: Float!
    liquidity: String!
    price: Float!
    priceChange24h: Float!
    volatility: Float!
    timestamp: Int!
    blockNumber: String!
  }

  type RebalanceEvent {
    id: ID!
    proposalId: String!
    pools: [String!]!
    ratios: [String!]!
    reason: String!
    timestamp: Int!
    executedAt: Int
    executed: Boolean!
    executor: String
    transactionHash: String
    blockNumber: String!
    gasUsed: String
  }

  type MarketCondition {
    id: ID!
    timestamp: Int!
    totalTVL: Float!
    averageAPR: Float!
    marketVolatility: Float!
    activePools: Int!
    totalVolume24h: Float!
  }

  type PriceFeed {
    id: ID!
    feedId: String!
    symbol: String!
    price: Float!
    confidence: Float!
    exponent: Int!
    timestamp: Int!
    blockNumber: String!
  }

  type AgentAction {
    id: ID!
    agentType: String!
    action: String!
    parameters: String
    result: String
    confidence: Float
    timestamp: Int!
    blockNumber: String!
    success: Boolean!
  }

  type Query {
    # Pool metrics
    poolMetrics(first: Int, skip: Int, orderBy: String, orderDirection: String): [PoolMetric!]!
    poolMetric(id: ID!): PoolMetric
    poolMetricsByAddress(poolAddress: String!, first: Int): [PoolMetric!]!
    
    # Rebalance events
    rebalanceEvents(first: Int, skip: Int, executed: Boolean): [RebalanceEvent!]!
    rebalanceEvent(id: ID!): RebalanceEvent
    pendingRebalances: [RebalanceEvent!]!
    
    # Market conditions
    marketConditions(first: Int, skip: Int): [MarketCondition!]!
    latestMarketCondition: MarketCondition
    
    # Price feeds
    priceFeeds: [PriceFeed!]!
    priceFeed(symbol: String!): PriceFeed
    
    # Agent actions
    agentActions(agentType: String, first: Int, skip: Int): [AgentAction!]!
    agentAction(id: ID!): AgentAction
    
    # Analytics
    poolPerformance(poolAddress: String!, days: Int): [PoolMetric!]!
    systemMetrics(days: Int): [MarketCondition!]!
  }
`);

// Mock data for development
const mockData = {
  poolMetrics: [
    {
      id: '1',
      poolAddress: '0x1234567890123456789012345678901234567890',
      poolName: 'ETH/USDC',
      token0: '0x...',
      token1: '0x...',
      token0Symbol: 'ETH',
      token1Symbol: 'USDC',
      tvlUSD: 1000000,
      volume24h: 50000,
      volume7d: 350000,
      feeAPR: 0.05,
      liquidity: '1000000000000000000000',
      price: 2500,
      priceChange24h: 0.02,
      volatility: 0.15,
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: '18500000'
    },
    {
      id: '2',
      poolAddress: '0x2345678901234567890123456789012345678901',
      poolName: 'BTC/USDC',
      token0: '0x...',
      token1: '0x...',
      token0Symbol: 'BTC',
      token1Symbol: 'USDC',
      tvlUSD: 2000000,
      volume24h: 100000,
      volume7d: 700000,
      feeAPR: 0.03,
      liquidity: '2000000000000000000000',
      price: 45000,
      priceChange24h: -0.01,
      volatility: 0.12,
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: '18500000'
    }
  ],
  
  rebalanceEvents: [
    {
      id: '1',
      proposalId: '1',
      pools: ['0x1234567890123456789012345678901234567890', '0x2345678901234567890123456789012345678901'],
      ratios: ['6000', '4000'],
      reason: 'Risk reduction due to high volatility',
      timestamp: Math.floor(Date.now() / 1000) - 3600,
      executedAt: Math.floor(Date.now() / 1000) - 3000,
      executed: true,
      executor: '0x...',
      transactionHash: '0x...',
      blockNumber: '18500000',
      gasUsed: '150000'
    }
  ],
  
  marketConditions: [
    {
      id: '1',
      timestamp: Math.floor(Date.now() / 1000),
      totalTVL: 3000000,
      averageAPR: 0.04,
      marketVolatility: 0.13,
      activePools: 2,
      totalVolume24h: 150000
    }
  ],
  
  priceFeeds: [
    {
      id: '1',
      feedId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
      symbol: 'ETH/USD',
      price: 2500,
      confidence: 0.01,
      exponent: -8,
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: '18500000'
    }
  ],
  
  agentActions: [
    {
      id: '1',
      agentType: 'allocator',
      action: 'propose_rebalance',
      parameters: '{"pools":["0x..."],"ratios":[6000,4000],"reason":"Risk reduction"}',
      result: '{"proposalId":"1","success":true}',
      confidence: 0.8,
      timestamp: Math.floor(Date.now() / 1000) - 3600,
      blockNumber: '18500000',
      success: true
    }
  ]
};

// Root resolver
const root = {
  // Pool metrics
  poolMetrics: ({ first = 10, skip = 0, orderBy = 'timestamp', orderDirection = 'desc' }) => {
    let metrics = [...mockData.poolMetrics];
    
    if (orderBy === 'tvlUSD') {
      metrics.sort((a, b) => orderDirection === 'desc' ? b.tvlUSD - a.tvlUSD : a.tvlUSD - b.tvlUSD);
    } else if (orderBy === 'feeAPR') {
      metrics.sort((a, b) => orderDirection === 'desc' ? b.feeAPR - a.feeAPR : a.feeAPR - b.feeAPR);
    }
    
    return metrics.slice(skip, skip + first);
  },
  
  poolMetric: ({ id }) => {
    return mockData.poolMetrics.find(metric => metric.id === id);
  },
  
  poolMetricsByAddress: ({ poolAddress, first = 10 }) => {
    return mockData.poolMetrics
      .filter(metric => metric.poolAddress === poolAddress)
      .slice(0, first);
  },
  
  // Rebalance events
  rebalanceEvents: ({ first = 10, skip = 0, executed }) => {
    let events = [...mockData.rebalanceEvents];
    
    if (executed !== undefined) {
      events = events.filter(event => event.executed === executed);
    }
    
    return events.slice(skip, skip + first);
  },
  
  rebalanceEvent: ({ id }) => {
    return mockData.rebalanceEvents.find(event => event.id === id);
  },
  
  pendingRebalances: () => {
    return mockData.rebalanceEvents.filter(event => !event.executed);
  },
  
  // Market conditions
  marketConditions: ({ first = 10, skip = 0 }) => {
    return mockData.marketConditions.slice(skip, skip + first);
  },
  
  latestMarketCondition: () => {
    return mockData.marketConditions[0];
  },
  
  // Price feeds
  priceFeeds: () => {
    return mockData.priceFeeds;
  },
  
  priceFeed: ({ symbol }) => {
    return mockData.priceFeeds.find(feed => feed.symbol === symbol);
  },
  
  // Agent actions
  agentActions: ({ agentType, first = 10, skip = 0 }) => {
    let actions = [...mockData.agentActions];
    
    if (agentType) {
      actions = actions.filter(action => action.agentType === agentType);
    }
    
    return actions.slice(skip, skip + first);
  },
  
  agentAction: ({ id }) => {
    return mockData.agentActions.find(action => action.id === id);
  },
  
  // Analytics
  poolPerformance: ({ poolAddress, days = 7 }) => {
    // Generate mock historical data
    const performance = [];
    const now = Date.now() / 1000;
    
    for (let i = days; i >= 0; i--) {
      const timestamp = now - (i * 24 * 3600);
      performance.push({
        id: `${poolAddress}-${timestamp}`,
        poolAddress,
        poolName: 'ETH/USDC',
        token0: '0x...',
        token1: '0x...',
        token0Symbol: 'ETH',
        token1Symbol: 'USDC',
        tvlUSD: 1000000 + (Math.random() - 0.5) * 100000,
        volume24h: 50000 + (Math.random() - 0.5) * 10000,
        volume7d: 350000,
        feeAPR: 0.05 + (Math.random() - 0.5) * 0.02,
        liquidity: '1000000000000000000000',
        price: 2500 + (Math.random() - 0.5) * 100,
        priceChange24h: (Math.random() - 0.5) * 0.1,
        volatility: 0.15 + (Math.random() - 0.5) * 0.05,
        timestamp: Math.floor(timestamp),
        blockNumber: '18500000'
      });
    }
    
    return performance;
  },
  
  systemMetrics: ({ days = 7 }) => {
    // Generate mock system metrics
    const metrics = [];
    const now = Date.now() / 1000;
    
    for (let i = days; i >= 0; i--) {
      const timestamp = now - (i * 24 * 3600);
      metrics.push({
        id: timestamp.toString(),
        timestamp: Math.floor(timestamp),
        totalTVL: 3000000 + (Math.random() - 0.5) * 300000,
        averageAPR: 0.04 + (Math.random() - 0.5) * 0.01,
        marketVolatility: 0.13 + (Math.random() - 0.5) * 0.05,
        activePools: 2 + Math.floor(Math.random() * 3),
        totalVolume24h: 150000 + (Math.random() - 0.5) * 50000
      });
    }
    
    return metrics;
  }
};

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true, // Enable GraphiQL interface
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LiquidAI Envio API server running on port ${PORT}`);
  console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
