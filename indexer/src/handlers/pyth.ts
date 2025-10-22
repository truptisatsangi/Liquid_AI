import { PriceFeedUpdate } from "../../generated/PythPriceFeed/PythPriceFeed";
import { PriceFeed, MarketCondition } from "../../generated/schema";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

/**
 * Handle PriceFeedUpdate events from Pyth
 */
export function handlePriceFeedUpdate(event: PriceFeedUpdate): void {
  let feedId = event.params.feedId.toHexString();
  let timestamp = event.block.timestamp.toI32();
  
  // Create or update price feed
  let priceFeed = PriceFeed.load(feedId);
  if (!priceFeed) {
    priceFeed = new PriceFeed(feedId);
    priceFeed.feedId = feedId;
    priceFeed.symbol = getSymbolFromFeedId(feedId);
  }
  
  // Update price data
  priceFeed.price = event.params.price.toF64();
  priceFeed.confidence = event.params.conf.toF64();
  priceFeed.exponent = event.params.expo.toI32();
  priceFeed.timestamp = timestamp;
  priceFeed.blockNumber = event.block.number;
  
  priceFeed.save();
  
  // Update market conditions
  updateMarketConditions(timestamp, event.block.number);
}

/**
 * Get symbol from feed ID
 */
function getSymbolFromFeedId(feedId: string): string {
  // Map common Pyth feed IDs to symbols
  let symbolMap = new Map<string, string>();
  symbolMap.set("0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", "ETH/USD");
  symbolMap.set("0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", "BTC/USD");
  symbolMap.set("0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db13491a2e6b12d", "USDC/USD");
  symbolMap.set("0x1fc18861232290221461220bd4e2acd1dcdfbc0c36d0accb6b8c8b3b60b7b8b8", "USDT/USD");
  
  return symbolMap.get(feedId) || "UNKNOWN/USD";
}

/**
 * Update market conditions based on price feeds
 */
function updateMarketConditions(timestamp: i32, blockNumber: BigInt): void {
  let conditionId = timestamp.toString();
  let condition = MarketCondition.load(conditionId);
  
  if (!condition) {
    condition = new MarketCondition(conditionId);
    condition.timestamp = timestamp;
    condition.totalTVL = 0;
    condition.averageAPR = 0;
    condition.marketVolatility = 0;
    condition.activePools = 0;
    condition.totalVolume24h = 0;
    condition.priceFeeds = [];
  }
  
  // Calculate market volatility from price feeds
  condition.marketVolatility = calculateMarketVolatility();
  
  // Update other metrics (would be calculated from pool data)
  condition.activePools = getActivePoolCount();
  condition.totalTVL = getTotalTVL();
  condition.averageAPR = getAverageAPR();
  condition.totalVolume24h = getTotalVolume24h();
  
  condition.save();
}

/**
 * Calculate market volatility from price feeds
 */
function calculateMarketVolatility(): f64 {
  // Simplified volatility calculation
  // In production, this would use historical price data
  return Math.random() * 0.5; // 0-50% volatility
}

/**
 * Get active pool count
 */
function getActivePoolCount(): i32 {
  // This would query the PoolMetric entities
  // For now, return a mock value
  return 10;
}

/**
 * Get total TVL across all pools
 */
function getTotalTVL(): f64 {
  // This would sum up all PoolMetric TVL values
  // For now, return a mock value
  return 10000000.0; // $10M
}

/**
 * Get average APR across all pools
 */
function getAverageAPR(): f64 {
  // This would calculate average from all PoolMetric APR values
  // For now, return a mock value
  return 0.05; // 5%
}

/**
 * Get total 24h volume across all pools
 */
function getTotalVolume24h(): f64 {
  // This would sum up all PoolMetric volume24h values
  // For now, return a mock value
  return 1000000.0; // $1M
}
