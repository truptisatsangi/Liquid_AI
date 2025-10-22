/**
 * Pyth Update Script
 * Updates price feeds on-chain using Pyth Network
 */

const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config();

class PythUpdater {
    constructor(config) {
        this.config = config;
        this.pythApiUrl = config.pythApiUrl || 'https://hermes.pyth.network';
        this.contractAddress = config.pythContractAddress;
        this.privateKey = config.privateKey;
        this.rpcUrl = config.rpcUrl;
        
        // Initialize provider and wallet
        this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
        this.wallet = new ethers.Wallet(this.privateKey, this.provider);
        
        // Pyth contract ABI
        this.pythABI = [
            "function updatePriceFeeds(bytes[] calldata updateData) external payable",
            "function updatePriceFeedsIfNecessary(bytes[] calldata updateData, bytes32[] calldata priceIds, uint64[] calldata publishTimes) external payable",
            "function getPriceNoOlderThan(bytes32 priceId, uint256 age) external view returns (tuple(int64 price, uint64 conf, int32 expo, uint256 publishTime))",
            "function getPrice(bytes32 priceId) external view returns (tuple(int64 price, uint64 conf, int32 expo, uint256 publishTime))",
            "function getValidTimePeriod() external view returns (uint256)",
            "function getUpdateFee(bytes[] calldata updateData) external view returns (uint256)"
        ];
        
        this.pythContract = new ethers.Contract(this.contractAddress, this.pythABI, this.wallet);
        
        // Price feed IDs
        this.priceFeedIds = {
            'ETH/USD': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
            'BTC/USD': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
            'USDC/USD': '0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db13491a2e6b12d',
            'USDT/USD': '0x1fc18861232290221461220bd4e2acd1dcdfbc0c36d0accb6b8c8b3b60b7b8b8'
        };
    }

    /**
     * Update price feeds on-chain
     */
    async updatePriceFeeds(symbols = null) {
        try {
            console.log('🔄 Updating price feeds on-chain...');
            
            // Determine which feeds to update
            const feedsToUpdate = symbols ? symbols : Object.keys(this.priceFeedIds);
            const feedIds = feedsToUpdate.map(symbol => this.priceFeedIds[symbol]).filter(Boolean);
            
            if (feedIds.length === 0) {
                throw new Error('No valid price feeds to update');
            }
            
            console.log(`📊 Updating ${feedIds.length} price feeds: ${feedsToUpdate.join(', ')}`);
            
            // Get update data from Pyth
            const updateData = await this.getUpdateData(feedIds);
            
            if (!updateData || updateData.length === 0) {
                throw new Error('No update data available from Pyth');
            }
            
            // Get update fee
            const updateFee = await this.pythContract.getUpdateFee(updateData);
            console.log(`💰 Update fee: ${ethers.formatEther(updateFee)} ETH`);
            
            // Check if updates are necessary
            const needsUpdate = await this.checkIfUpdateNeeded(feedIds);
            if (!needsUpdate) {
                console.log('✅ All price feeds are up to date');
                return;
            }
            
            // Execute update transaction
            const tx = await this.pythContract.updatePriceFeeds(updateData, {
                value: updateFee,
                gasLimit: 1000000 // Conservative gas limit
            });
            
            console.log(`⏳ Transaction submitted: ${tx.hash}`);
            
            // Wait for confirmation
            const receipt = await tx.wait();
            console.log(`✅ Price feeds updated successfully in block ${receipt.blockNumber}`);
            console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
            
            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                feedsUpdated: feedsToUpdate
            };
            
        } catch (error) {
            console.error('❌ Error updating price feeds:', error.message);
            throw error;
        }
    }

    /**
     * Get update data from Pyth Network
     */
    async getUpdateData(feedIds) {
        try {
            console.log('📡 Fetching update data from Pyth Network...');
            
            const response = await axios.get(`${this.pythApiUrl}/api/get_price_feeds`, {
                params: {
                    'ids[]': feedIds
                }
            });
            
            if (!response.data || !response.data.price_feeds) {
                throw new Error('Invalid response from Pyth API');
            }
            
            // Convert to bytes array (simplified - in reality you'd need proper Pyth encoding)
            const updateData = response.data.price_feeds.map(feed => {
                // This is a simplified version - actual implementation would use Pyth's encoding
                return ethers.toUtf8Bytes(JSON.stringify(feed));
            });
            
            console.log(`📦 Retrieved update data for ${updateData.length} feeds`);
            return updateData;
            
        } catch (error) {
            console.error('❌ Error fetching update data:', error.message);
            throw error;
        }
    }

    /**
     * Check if price feed updates are needed
     */
    async checkIfUpdateNeeded(feedIds) {
        try {
            const validTimePeriod = await this.pythContract.getValidTimePeriod();
            const currentTime = Math.floor(Date.now() / 1000);
            const maxAge = Number(validTimePeriod);
            
            console.log(`⏰ Valid time period: ${maxAge} seconds`);
            
            for (const feedId of feedIds) {
                try {
                    const priceData = await this.pythContract.getPriceNoOlderThan(feedId, maxAge);
                    const publishTime = Number(priceData.publishTime);
                    const age = currentTime - publishTime;
                    
                    if (age > maxAge) {
                        console.log(`⚠️ Feed ${feedId} is ${age} seconds old (max: ${maxAge})`);
                        return true;
                    }
                } catch (error) {
                    console.log(`⚠️ Feed ${feedId} needs update (error: ${error.message})`);
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Error checking update status:', error.message);
            return true; // Assume update is needed if we can't check
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
            
            const price = Number(priceData.price);
            const conf = Number(priceData.conf);
            const expo = Number(priceData.expo);
            const publishTime = Number(priceData.publishTime);
            
            // Adjust for exponent
            const adjustedPrice = price * Math.pow(10, expo);
            const adjustedConf = conf * Math.pow(10, expo);
            
            return {
                symbol,
                price: adjustedPrice,
                confidence: adjustedConf,
                exponent: expo,
                publishTime: publishTime,
                age: Math.floor(Date.now() / 1000) - publishTime
            };
            
        } catch (error) {
            console.error(`❌ Error getting price for ${symbol}:`, error.message);
            throw error;
        }
    }

    /**
     * Get all current prices
     */
    async getAllCurrentPrices() {
        const prices = {};
        
        for (const symbol of Object.keys(this.priceFeedIds)) {
            try {
                prices[symbol] = await this.getCurrentPrice(symbol);
            } catch (error) {
                console.error(`❌ Failed to get price for ${symbol}:`, error.message);
                prices[symbol] = null;
            }
        }
        
        return prices;
    }

    /**
     * Check price feed health
     */
    async checkPriceFeedHealth() {
        console.log('🏥 Checking price feed health...');
        
        const health = {};
        const validTimePeriod = await this.pythContract.getValidTimePeriod();
        const maxAge = Number(validTimePeriod);
        
        for (const symbol of Object.keys(this.priceFeedIds)) {
            try {
                const price = await this.getCurrentPrice(symbol);
                const isHealthy = price.age <= maxAge;
                
                health[symbol] = {
                    healthy: isHealthy,
                    age: price.age,
                    maxAge: maxAge,
                    price: price.price,
                    confidence: price.confidence
                };
                
                console.log(`${isHealthy ? '✅' : '❌'} ${symbol}: ${price.price.toFixed(2)} (age: ${price.age}s)`);
                
            } catch (error) {
                health[symbol] = {
                    healthy: false,
                    error: error.message
                };
                console.log(`❌ ${symbol}: Error - ${error.message}`);
            }
        }
        
        return health;
    }
}

// CLI interface
if (require.main === module) {
    const config = {
        pythApiUrl: process.env.PYTH_PRICE_SERVICE_URL || 'https://hermes.pyth.network',
        pythContractAddress: process.env.PYTH_CONTRACT_ADDRESS || '0x4305FB66699C3B2702D4d05CF36551390A4c69C6',
        privateKey: process.env.PRIVATE_KEY || '',
        rpcUrl: process.env.SEPOLIA_RPC_URL || 'http://localhost:8545'
    };
    
    const updater = new PythUpdater(config);
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'update';
    const symbols = args.slice(1);
    
    async function runCommand() {
        try {
            switch (command) {
                case 'update':
                    await updater.updatePriceFeeds(symbols.length > 0 ? symbols : null);
                    break;
                    
                case 'prices':
                    const prices = await updater.getAllCurrentPrices();
                    console.log('\n📊 Current Prices:');
                    Object.entries(prices).forEach(([symbol, data]) => {
                        if (data) {
                            console.log(`${symbol}: $${data.price.toFixed(2)} (conf: ${data.confidence.toFixed(4)}, age: ${data.age}s)`);
                        } else {
                            console.log(`${symbol}: Error`);
                        }
                    });
                    break;
                    
                case 'health':
                    await updater.checkPriceFeedHealth();
                    break;
                    
                default:
                    console.log('Usage: node pyth-update.js [update|prices|health] [symbols...]');
                    console.log('Examples:');
                    console.log('  node pyth-update.js update');
                    console.log('  node pyth-update.js update ETH/USD BTC/USD');
                    console.log('  node pyth-update.js prices');
                    console.log('  node pyth-update.js health');
            }
        } catch (error) {
            console.error('❌ Command failed:', error.message);
            process.exit(1);
        }
    }
    
    runCommand();
}

module.exports = PythUpdater;
