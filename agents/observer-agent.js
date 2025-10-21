/**
 * ObserverAgent - Monitors DEX pool data and market conditions
 * Queries Envio and Pyth data periodically to feed into the decision-making process
 */

const axios = require('axios');
const cron = require('node-cron');
const { ethers } = require('ethers');

class ObserverAgent {
    constructor(config) {
        this.config = config;
        this.envioApiUrl = config.envioApiUrl;
        this.pythApiUrl = config.pythApiUrl;
        this.pools = config.pools || [];
        this.observations = new Map();
        this.isRunning = false;
    }

    /**
     * Start the observer agent
     */
    async start() {
        console.log('🔍 ObserverAgent starting...');
        this.isRunning = true;

        // Initial data fetch
        await this.observeMarkets();

        // Schedule periodic observations every 30 seconds
        cron.schedule('*/30 * * * * *', async () => {
            if (this.isRunning) {
                await this.observeMarkets();
            }
        });

        console.log('✅ ObserverAgent started successfully');
    }

    /**
     * Stop the observer agent
     */
    stop() {
        console.log('🛑 ObserverAgent stopping...');
        this.isRunning = false;
    }

    /**
     * Main observation function
     */
    async observeMarkets() {
        try {
            console.log('📊 Observing market conditions...');

            // Fetch pool data from Envio
            const poolData = await this.fetchPoolData();
            
            // Fetch price and volatility data from Pyth
            const priceData = await this.fetchPriceData();
            
            // Calculate market metrics
            const metrics = this.calculateMetrics(poolData, priceData);
            
            // Store observations
            this.observations.set(Date.now(), metrics);
            
            // Keep only last 100 observations
            if (this.observations.size > 100) {
                const oldestKey = Math.min(...this.observations.keys());
                this.observations.delete(oldestKey);
            }

            console.log('✅ Market observation completed');
            return metrics;

        } catch (error) {
            console.error('❌ Error in market observation:', error.message);
            throw error;
        }
    }

    /**
     * Fetch pool data from Envio indexer
     */
    async fetchPoolData() {
        try {
            const query = `
                query GetPoolMetrics {
                    poolMetrics(
                        first: 10
                        orderBy: timestamp
                        orderDirection: desc
                    ) {
                        id
                        poolAddress
                        tvlUSD
                        volume24h
                        feeAPR
                        timestamp
                    }
                }
            `;

            const response = await axios.post(this.envioApiUrl, {
                query: query
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.envioApiKey}`
                }
            });

            return response.data.data.poolMetrics;

        } catch (error) {
            console.error('❌ Error fetching pool data from Envio:', error.message);
            // Return mock data for development
            return this.getMockPoolData();
        }
    }

    /**
     * Fetch price and volatility data from Pyth
     */
    async fetchPriceData() {
        try {
            const feedIds = [
                '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH/USD
                '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43'  // BTC/USD
            ];

            const response = await axios.get(`${this.pythApiUrl}/api/latest_price_feeds`, {
                params: {
                    'ids[]': feedIds
                }
            });

            return response.data;

        } catch (error) {
            console.error('❌ Error fetching price data from Pyth:', error.message);
            // Return mock data for development
            return this.getMockPriceData();
        }
    }

    /**
     * Calculate market metrics from raw data
     */
    calculateMetrics(poolData, priceData) {
        const metrics = {
            timestamp: Date.now(),
            pools: {},
            marketVolatility: 0,
            averageAPR: 0,
            totalTVL: 0,
            recommendations: []
        };

        // Process pool data
        let totalAPR = 0;
        let poolCount = 0;

        poolData.forEach(pool => {
            metrics.pools[pool.poolAddress] = {
                tvlUSD: parseFloat(pool.tvlUSD),
                volume24h: parseFloat(pool.volume24h),
                feeAPR: parseFloat(pool.feeAPR),
                timestamp: pool.timestamp
            };

            totalAPR += parseFloat(pool.feeAPR);
            poolCount++;
            metrics.totalTVL += parseFloat(pool.tvlUSD);
        });

        metrics.averageAPR = poolCount > 0 ? totalAPR / poolCount : 0;

        // Calculate volatility from price data
        if (priceData && priceData.length > 0) {
            metrics.marketVolatility = this.calculateVolatility(priceData);
        }

        // Generate recommendations based on MeTTa logic
        metrics.recommendations = this.generateRecommendations(metrics);

        return metrics;
    }

    /**
     * Calculate market volatility from price feeds
     */
    calculateVolatility(priceData) {
        // Simplified volatility calculation
        // In production, you'd want to use proper statistical methods
        let totalVolatility = 0;
        let count = 0;

        priceData.forEach(feed => {
            if (feed.price && feed.price.price) {
                // Mock volatility calculation - in reality you'd use historical data
                const volatility = Math.random() * 0.5; // 0-50% volatility
                totalVolatility += volatility;
                count++;
            }
        });

        return count > 0 ? totalVolatility / count : 0;
    }

    /**
     * Generate recommendations using MeTTa-like logic
     */
    generateRecommendations(metrics) {
        const recommendations = [];

        // MeTTa-style conditional logic
        if (metrics.marketVolatility > 0.6) {
            recommendations.push({
                type: 'risk_reduction',
                message: 'High volatility detected - suggest moving 20% from volatile pools to stable pools',
                priority: 'high',
                action: 'rebalance',
                parameters: {
                    fromVolatile: 0.2,
                    toStable: 0.2
                }
            });
        }

        if (metrics.averageAPR < 0.03) {
            recommendations.push({
                type: 'yield_optimization',
                message: 'Low APR detected - suggest withdrawing and reallocating to higher-yield pools',
                priority: 'medium',
                action: 'rebalance',
                parameters: {
                    minAPR: 0.05
                }
            });
        }

        // Check for individual pool issues
        Object.entries(metrics.pools).forEach(([poolAddress, poolData]) => {
            if (poolData.feeAPR < 0.01) {
                recommendations.push({
                    type: 'pool_optimization',
                    message: `Pool ${poolAddress.slice(0, 8)}... has very low APR (${poolData.feeAPR})`,
                    priority: 'low',
                    action: 'monitor',
                    poolAddress: poolAddress
                });
            }
        });

        return recommendations;
    }

    /**
     * Get latest observations
     */
    getLatestObservations(count = 10) {
        const sortedKeys = Array.from(this.observations.keys()).sort((a, b) => b - a);
        const latestKeys = sortedKeys.slice(0, count);
        
        return latestKeys.map(key => ({
            timestamp: key,
            data: this.observations.get(key)
        }));
    }

    /**
     * Mock data for development
     */
    getMockPoolData() {
        return [
            {
                id: '1',
                poolAddress: '0x1234567890123456789012345678901234567890',
                tvlUSD: '1000000',
                volume24h: '50000',
                feeAPR: '0.05',
                timestamp: Math.floor(Date.now() / 1000)
            },
            {
                id: '2',
                poolAddress: '0x2345678901234567890123456789012345678901',
                tvlUSD: '2000000',
                volume24h: '100000',
                feeAPR: '0.03',
                timestamp: Math.floor(Date.now() / 1000)
            }
        ];
    }

    getMockPriceData() {
        return [
            {
                id: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
                price: {
                    price: '2500000000', // $2500 in 8 decimals
                    conf: '1000000',
                    expo: -8
                }
            }
        ];
    }
}

module.exports = ObserverAgent;
