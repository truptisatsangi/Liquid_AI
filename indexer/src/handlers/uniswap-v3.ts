import { Swap, Mint, Burn, Collect } from "../../generated/UniswapV3Pool/UniswapV3Pool";
import { PoolMetric, PoolPerformance } from "../../generated/schema";
import { BigInt, Bytes, BigDecimal } from "@graphprotocol/graph-ts";

/**
 * Handle Swap events from UniswapV3 pools
 */
export function handleSwap(event: Swap): void {
  let poolAddress = event.address.toHexString();
  let timestamp = event.block.timestamp.toI32();
  let date = new Date(timestamp * 1000).toISOString().split('T')[0];
  
  // Create or update pool metric
  let poolMetric = PoolMetric.load(poolAddress + "-" + timestamp.toString());
  if (!poolMetric) {
    poolMetric = new PoolMetric(poolAddress + "-" + timestamp.toString());
    poolMetric.poolAddress = poolAddress;
    poolMetric.timestamp = timestamp;
    poolMetric.blockNumber = event.block.number;
    
    // Initialize with default values
    poolMetric.tvlUSD = 0;
    poolMetric.volume24h = 0;
    poolMetric.volume7d = 0;
    poolMetric.feeAPR = 0;
    poolMetric.liquidity = BigInt.fromI32(0);
    poolMetric.price = 0;
    poolMetric.priceChange24h = 0;
    poolMetric.volatility = 0;
  }
  
  // Calculate swap volume in USD (simplified)
  let amount0 = event.params.amount0.abs();
  let amount1 = event.params.amount1.abs();
  let volumeUSD = amount0.toBigDecimal().plus(amount1.toBigDecimal());
  
  poolMetric.volume24h = volumeUSD.toF64();
  poolMetric.save();
  
  // Update daily performance
  let performanceId = poolAddress + "-" + date;
  let performance = PoolPerformance.load(performanceId);
  if (!performance) {
    performance = new PoolPerformance(performanceId);
    performance.poolAddress = poolAddress;
    performance.date = date;
    performance.dailyVolume = 0;
    performance.dailyFees = 0;
    performance.apr = 0;
    performance.tvlChange = 0;
    performance.timestamp = timestamp;
  }
  
  performance.dailyVolume = performance.dailyVolume + volumeUSD.toF64();
  performance.save();
}

/**
 * Handle Mint events from UniswapV3 pools
 */
export function handleMint(event: Mint): void {
  let poolAddress = event.address.toHexString();
  let timestamp = event.block.timestamp.toI32();
  
  // Create or update pool metric
  let poolMetric = PoolMetric.load(poolAddress + "-" + timestamp.toString());
  if (!poolMetric) {
    poolMetric = new PoolMetric(poolAddress + "-" + timestamp.toString());
    poolMetric.poolAddress = poolAddress;
    poolMetric.timestamp = timestamp;
    poolMetric.blockNumber = event.block.number;
    
    // Initialize with default values
    poolMetric.tvlUSD = 0;
    poolMetric.volume24h = 0;
    poolMetric.volume7d = 0;
    poolMetric.feeAPR = 0;
    poolMetric.liquidity = BigInt.fromI32(0);
    poolMetric.price = 0;
    poolMetric.priceChange24h = 0;
    poolMetric.volatility = 0;
  }
  
  // Update liquidity
  poolMetric.liquidity = event.params.amount;
  
  // Calculate TVL (simplified - would need price feeds for accurate USD value)
  let tvlUSD = event.params.amount.toBigDecimal().div(BigDecimal.fromString("1000000000000000000")); // Assuming 18 decimals
  poolMetric.tvlUSD = tvlUSD.toF64();
  
  poolMetric.save();
}

/**
 * Handle Burn events from UniswapV3 pools
 */
export function handleBurn(event: Burn): void {
  let poolAddress = event.address.toHexString();
  let timestamp = event.block.timestamp.toI32();
  
  // Create or update pool metric
  let poolMetric = PoolMetric.load(poolAddress + "-" + timestamp.toString());
  if (!poolMetric) {
    poolMetric = new PoolMetric(poolAddress + "-" + timestamp.toString());
    poolMetric.poolAddress = poolAddress;
    poolMetric.timestamp = timestamp;
    poolMetric.blockNumber = event.block.number;
    
    // Initialize with default values
    poolMetric.tvlUSD = 0;
    poolMetric.volume24h = 0;
    poolMetric.volume7d = 0;
    poolMetric.feeAPR = 0;
    poolMetric.liquidity = BigInt.fromI32(0);
    poolMetric.price = 0;
    poolMetric.priceChange24h = 0;
    poolMetric.volatility = 0;
  }
  
  // Update liquidity (subtract burned amount)
  poolMetric.liquidity = poolMetric.liquidity.minus(event.params.amount);
  
  // Recalculate TVL
  let tvlUSD = poolMetric.liquidity.toBigDecimal().div(BigDecimal.fromString("1000000000000000000"));
  poolMetric.tvlUSD = tvlUSD.toF64();
  
  poolMetric.save();
}

/**
 * Handle Collect events from UniswapV3 pools
 */
export function handleCollect(event: Collect): void {
  let poolAddress = event.address.toHexString();
  let timestamp = event.block.timestamp.toI32();
  let date = new Date(timestamp * 1000).toISOString().split('T')[0];
  
  // Calculate fees collected
  let feesCollected = event.params.amount0.plus(event.params.amount1);
  let feesUSD = feesCollected.toBigDecimal().div(BigDecimal.fromString("1000000000000000000"));
  
  // Update daily performance
  let performanceId = poolAddress + "-" + date;
  let performance = PoolPerformance.load(performanceId);
  if (!performance) {
    performance = new PoolPerformance(performanceId);
    performance.poolAddress = poolAddress;
    performance.date = date;
    performance.dailyVolume = 0;
    performance.dailyFees = 0;
    performance.apr = 0;
    performance.tvlChange = 0;
    performance.timestamp = timestamp;
  }
  
  performance.dailyFees = performance.dailyFees + feesUSD.toF64();
  
  // Calculate APR (simplified)
  if (performance.dailyFees > 0) {
    performance.apr = (performance.dailyFees * 365) / 1000000; // Assuming 1M TVL
  }
  
  performance.save();
}
