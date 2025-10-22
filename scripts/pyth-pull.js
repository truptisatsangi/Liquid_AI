/**
 * Pyth Pull Oracle Script
 * Pulls real-time price and volatility data from Pyth Network
 */

const axios = require('axios');
const { ethers } = require('ethers');
const cron = require('node-cron');
require('dotenv').config();

class PythPullOracle {
    constructor(config) {
        this.config = config;
        this.pythApiUrl = config.pythApiUrl || 'https://hermes.pyth.network';
        this.contractAddress = config.pythContractAddress;
        this.privateKey = config.privateKey;
        this.rpcUrl = config.rpcUrl;
        
        // Initialize provider and wallet
        this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
        this.wallet = new ethers.Wallet(this.privateKey, this.provider);
        
        // Pyth contract ABI (simplified)
        this.pythABI = [
            "function updatePriceFeeds(bytes[] calldata updateData) external payable",
            "function getPriceNoOlderThan(bytes32 priceId, uint256 age) external view returns (tuple(int64 price, uint64 conf, int32 expo, uint256 publishTime))",
            "function getPrice(bytes32 priceId) external view returns (tuple(int64 price, uint64 conf, int32 expo, uint256 publishTime))"
        ];
        
        this.pythContract = new ethers.Contract(this.contractAddress, this.pythABI, this.wallet);
        
        // Price feed IDs for common assets
        this.priceFeedIds = {
            'ETH/USD': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
            'BTC/USD': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
            'USDC/USD': '0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db13491a2e6b12d',
            'USDT/USD': '0x1fc18861232290221461220bd4e2acd1dcdfbc0c36d0accb6b8c8b3b60b7b8b8'
        };
        
        this.priceHistory = new Map();
        this.isRunning = false;
    }

    /**
     * Start the Pyth pull oracle
     */
    async start() {
        console.log('🔮 Starting Pyth Pull Oracle...');
        this.isRunning = true;

        // Initial price fetch
        await this.pullLatestPrices();

        // Schedule periodic price updates every 30 seconds
        cron.schedule('*/30 * * * * *', async () => {
            if (this.isRunning) {
                await this.pullLatestPrices();
            }
        });

        console.log('✅ Pyth Pull Oracle started successfully');
    }

    /**
     * Stop the Pyth pull oracle
     */
    stop() {
        console.log('🛑 Stopping Pyth Pull Oracle...');
        this.isRunning = false;
    }

    /**
     * Pull latest prices from Pyth Network
     */
    async pullLatestPrices() {
        try {
            console.log('📊 Pulling latest prices from Pyth Network...');

            // Get price feed IDs
            const feedIds = Object.values(this.priceFeedIds);
            
            // Fetch latest price feeds from Pyth API
            const response = await axios.get(`${this.pythApiUrl}/api/latest_price_feeds`, {
                params: {
                    'ids[]': feedIds
                }
            });

            const priceFeeds = response.data;
            console.log(`📈 Retrieved ${priceFeeds.length} price feeds`);

            // Process each price feed
            for (const feed of priceFeeds) {
                await this.processPriceFeed(feed);
            }

            // Update on-chain if configured
            if (this.config.updateOnChain) {
                await this.updateOnChainPrices(priceFeeds);
            }

            console.log('✅ Price pull completed successfully');

        } catch (error) {
            console.error('❌ Error pulling prices:', error.message);
            throw error;
        }
    }

    /**
     * Process individual price feed
     */
    async processPriceFeed(feed) {
        try {
            const symbol = this.getSymbolFromFeedId(feed.id);
            const price = this.parsePrice(feed.price);
            
            // Store price history
            const timestamp = Date.now();
            if (!this.priceHistory.has(symbol)) {
                this.priceHistory.set(symbol, []);
            }
            
            const history = this.priceHistory.get(symbol);
            history.push({
                price: price.price,
                confidence: price.confidence,
                timestamp: timestamp,
                publishTime: feed.price.publish_time
            });
            
            // Keep only last 1000 entries
            if (history.length > 1000) {
                history.shift();
            }
            
            // Calculate volatility
            const volatility = this.calculateVolatility(symbol);
            
            console.log(`💰 ${symbol}: $${price.price.toFixed(2)} (conf: ${price.confidence.toFixed(4)}, vol: ${(volatility * 100).toFixed(2)}%)`);

        } catch (error) {
            console.error(`❌ Error processing price feed ${feed.id}:`, error.message);
        }
    }

    /**
     * Parse price from Pyth feed
     */
    parsePrice(priceData) {
        const price = parseFloat(priceData.price);
        const conf = parseFloat(priceData.conf);
        const expo = parseInt(priceData.expo);
        
        // Adjust for exponent
        const adjustedPrice = price * Math.pow(10, expo);
        const adjustedConf = conf * Math.pow(10, expo);
        
        return {
            price: adjustedPrice,
            confidence: adjustedConf,
            exponent: expo,
            publishTime: parseInt(priceData.publish_time)
        };
    }

    /**
     * Get symbol from feed ID
     */
    getSymbolFromFeedId(feedId) {
        for (const [symbol, id] of Object.entries(this.priceFeedIds)) {
            if (id === feedId) {
                return symbol;
            }
        }
        return 'UNKNOWN';
    }

    /**
     * Calculate volatility for a symbol
     */
    calculateVolatility(symbol) {
        const history = this.priceHistory.get(symbol);
        if (!history || history.length < 2) {
            return 0;
        }
        
        // Calculate returns
        const returns = [];
        for (let i = 1; i < history.length; i++) {
            const prevPrice = history[i - 1].price;
            const currPrice = history[i].price;
            const ret = (currPrice - prevPrice) / prevPrice;
            returns.push(ret);
        }
        
        // Calculate standard deviation (volatility)
        const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance);
        
        return volatility;
    }

    /**
     * Update prices on-chain
     */
    async updateOnChainPrices(priceFeeds) {
        try {
            console.log('⛓️ Updating prices on-chain...');
            
            // Prepare update data (simplified - in reality you'd need proper Pyth update data)
            const updateData = priceFeeds.map(feed => {
                // This would be the actual update data from Pyth
                return ethers.toUtf8Bytes(JSON.stringify(feed));
            });
            
            // Estimate gas
            const gasEstimate = await this.pythContract.updatePriceFeeds.estimateGas(updateData);
            
            // Execute transaction
            const tx = await this.pythContract.updatePriceFeeds(updateData, {
                gasLimit: gasEstimate * 2n, // Add buffer
                value: ethers.parseEther('0.001') // Small fee for Pyth
            });
            
            console.log(`⏳ Transaction submitted: ${tx.hash}`);
            
            // Wait for confirmation
            const receipt = await tx.wait();
            console.log(`✅ Prices updated on-chain in block ${receipt.blockNumber}`);
            
        } catch (error) {
            console.error('❌ Error updating prices on-chain:', error.message);
        }
    }

    /**
     * Get current price for a symbol
     */
    async getCurrentPrice(symbol) {
        const feedId = this.priceFeedIds[symbol];
        if (!feedId) {
            throw new Error(`Unknown symbol: ${symbol}`);
        }
        
        try {
            const priceData = await this.pythContract.getPrice(feedId);
            return this.parsePrice({
                price: priceData.price.toString(),
                conf: priceData.conf.toString(),
                expo: priceData.expo.toString(),
                publish_time: priceData.publishTime.toString()
            });
        } catch (error) {
            console.error(`❌ Error getting price for ${symbol}:`, error.message);
            throw error;
        }
    }

    /**
     * Get price history for a symbol
     */
    getPriceHistory(symbol, limit = 100) {
        const history = this.priceHistory.get(symbol);
        if (!history) {
            return [];
        }
        
        return history.slice(-limit);
    }

    /**
     * Get all current prices
     */
    getAllCurrentPrices() {
        const prices = {};
        
        for (const symbol of Object.keys(this.priceFeedIds)) {
            const history = this.priceHistory.get(symbol);
            if (history && history.length > 0) {
                const latest = history[history.length - 1];
                prices[symbol] = {
                    price: latest.price,
                    confidence: latest.confidence,
                    volatility: this.calculateVolatility(symbol),
                    timestamp: latest.timestamp
                };
            }
        }
        
        return prices;
    }

    /**
     * Get market volatility summary
     */
    getMarketVolatility() {
        const volatilities = [];
        
        for (const symbol of Object.keys(this.priceFeedIds)) {
            const volatility = this.calculateVolatility(symbol);
            if (volatility > 0) {
                volatilities.push(volatility);
            }
        }
        
        if (volatilities.length === 0) {
            return 0;
        }
        
        // Calculate average volatility
        const avgVolatility = volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;
        
        return avgVolatility;
    }
}

// CLI interface
if (require.main === module) {
    const config = {
        pythApiUrl: process.env.PYTH_PRICE_SERVICE_URL || 'https://hermes.pyth.network',
        pythContractAddress: process.env.PYTH_CONTRACT_ADDRESS || '0x4305FB66699C3B2702D4d05CF36551390A4c69C6',
        privateKey: process.env.PRIVATE_KEY || '',
        rpcUrl: process.env.SEPOLIA_RPC_URL || 'http://localhost:8545',
        updateOnChain: process.env.UPDATE_ON_CHAIN === 'true'
    };
    
    const oracle = new PythPullOracle(config);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        oracle.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        oracle.stop();
        process.exit(0);
    });
    
    // Start the oracle
    oracle.start().catch(error => {
        console.error('❌ Failed to start Pyth oracle:', error);
        process.exit(1);
    });
}

module.exports = PythPullOracle;
