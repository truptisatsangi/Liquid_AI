import { EnvioConfig } from "@envio-dev/hyperindex";

const config: EnvioConfig = {
  networks: [
    {
      name: "mainnet",
      chainId: 1,
      rpcUrl: process.env.MAINNET_RPC_URL || "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    },
    {
      name: "sepolia",
      chainId: 11155111,
      rpcUrl: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    },
    {
      name: "hardhat",
      chainId: 31337,
      rpcUrl: "http://localhost:8545",
    },
  ],
  
  contracts: [
    {
      name: "LiquidityVault",
      address: process.env.LIQUIDITY_VAULT_ADDRESS || "0x...",
      abi: "LiquidityVault",
      startBlock: 0,
    },
    {
      name: "UniswapV3Factory",
      address: "0x1F98431c8aD98523631AE4a59f267346ea31F984", // Mainnet
      abi: "UniswapV3Factory",
      startBlock: 12369621,
    },
    {
      name: "UniswapV3Pool",
      address: "*", // Dynamic pools
      abi: "UniswapV3Pool",
      startBlock: 12369621,
    },
    {
      name: "PythPriceFeed",
      address: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6", // Mainnet
      abi: "PythPriceFeed",
      startBlock: 0,
    },
  ],
  
  dataSources: [
    {
      name: "LiquidityVaultEvents",
      contract: "LiquidityVault",
      events: [
        "RebalanceProposed",
        "RebalanceExecuted",
        "AgentAuthorityUpdated",
      ],
    },
    {
      name: "UniswapV3PoolEvents",
      contract: "UniswapV3Pool",
      events: [
        "Swap",
        "Mint",
        "Burn",
        "Collect",
      ],
    },
    {
      name: "PythPriceUpdates",
      contract: "PythPriceFeed",
      events: [
        "PriceFeedUpdate",
      ],
    },
  ],
  
  handlers: [
    {
      name: "handleRebalanceProposed",
      dataSource: "LiquidityVaultEvents",
      event: "RebalanceProposed",
      handler: "handleRebalanceProposed",
    },
    {
      name: "handleRebalanceExecuted",
      dataSource: "LiquidityVaultEvents",
      event: "RebalanceExecuted",
      handler: "handleRebalanceExecuted",
    },
    {
      name: "handleSwap",
      dataSource: "UniswapV3PoolEvents",
      event: "Swap",
      handler: "handleSwap",
    },
    {
      name: "handleMint",
      dataSource: "UniswapV3PoolEvents",
      event: "Mint",
      handler: "handleMint",
    },
    {
      name: "handleBurn",
      dataSource: "UniswapV3PoolEvents",
      event: "Burn",
      handler: "handleBurn",
    },
    {
      name: "handlePriceFeedUpdate",
      dataSource: "PythPriceUpdates",
      event: "PriceFeedUpdate",
      handler: "handlePriceFeedUpdate",
    },
  ],
  
  api: {
    port: 3001,
    cors: {
      origin: ["http://localhost:3000", "https://liquidai.vercel.app"],
      credentials: true,
    },
  },
  
  database: {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "liquidai",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
  },
  
  indexing: {
    batchSize: 1000,
    concurrency: 4,
    retryAttempts: 3,
    retryDelay: 5000,
  },
};

export default config;
