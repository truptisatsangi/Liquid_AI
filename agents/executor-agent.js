/**
 * ExecutorAgent - Triggers contract calls via ASI:One intents
 * Executes allocation strategies by interacting with the LiquidityVault contract
 */

const { ethers } = require('ethers');
const axios = require('axios');

class ExecutorAgent {
    constructor(config) {
        this.config = config;
        this.asiApiUrl = config.asiApiUrl;
        this.asiApiKey = config.asiApiKey;
        this.contractAddress = config.contractAddress;
        this.privateKey = config.privateKey;
        this.rpcUrl = config.rpcUrl;
        
        // Initialize provider and wallet
        this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
        this.wallet = new ethers.Wallet(this.privateKey, this.provider);
        
        // Contract ABI (simplified for demo)
        this.contractABI = [
            "function proposeRebalance(address[] calldata pools, uint256[] calldata ratios, string calldata reason) external returns (uint256)",
            "function executeRebalance(uint256 proposalId) external",
            "function getProposalCount() external view returns (uint256)",
            "function getRebalanceProposal(uint256 proposalId) external view returns (tuple(address[] pools, uint256[] ratios, uint256 timestamp, bool executed, string reason))",
            "event RebalanceProposed(uint256 indexed proposalId, address[] pools, uint256[] ratios, string reason)",
            "event RebalanceExecuted(uint256 indexed proposalId, address[] pools, uint256[] ratios)"
        ];
        
        this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.wallet);
        this.executionHistory = [];
    }

    /**
     * Start the executor agent
     */
    async start() {
        console.log('⚡ ExecutorAgent starting...');
        
        // Verify contract connection
        try {
            const proposalCount = await this.contract.getProposalCount();
            console.log(`📋 Connected to LiquidityVault at ${this.contractAddress}`);
            console.log(`📊 Current proposal count: ${proposalCount}`);
        } catch (error) {
            console.error('❌ Failed to connect to LiquidityVault:', error.message);
            throw error;
        }
        
        console.log('✅ ExecutorAgent started successfully');
    }

    /**
     * Execute an allocation strategy
     * @param {Object} allocationStrategy - Strategy from AllocatorAgent
     * @returns {Object} Execution result
     */
    async executeStrategy(allocationStrategy) {
        try {
            console.log('🚀 Executing allocation strategy...');
            
            // Validate strategy
            this.validateStrategy(allocationStrategy);
            
            // Create ASI:One intent for the transaction
            const intent = await this.createASIIntent(allocationStrategy);
            
            // Execute the transaction
            const result = await this.executeTransaction(allocationStrategy, intent);
            
            // Store execution history
            this.executionHistory.push({
                timestamp: Date.now(),
                strategy: allocationStrategy,
                result: result,
                intent: intent
            });
            
            console.log('✅ Strategy execution completed');
            return result;

        } catch (error) {
            console.error('❌ Error executing strategy:', error.message);
            throw error;
        }
    }

    /**
     * Validate allocation strategy before execution
     */
    validateStrategy(strategy) {
        if (!strategy.pools || strategy.pools.length === 0) {
            throw new Error('Invalid strategy: no pools specified');
        }
        
        const totalAllocation = strategy.pools.reduce((sum, pool) => sum + pool.allocation, 0);
        if (totalAllocation !== 10000) {
            throw new Error(`Invalid strategy: total allocation is ${totalAllocation}, expected 10000`);
        }
        
        // Validate pool addresses
        strategy.pools.forEach(pool => {
            if (!ethers.isAddress(pool.poolAddress)) {
                throw new Error(`Invalid pool address: ${pool.poolAddress}`);
            }
        });
    }

    /**
     * Create ASI:One intent for the transaction
     */
    async createASIIntent(strategy) {
        try {
            const intent = {
                type: 'liquidity_rebalance',
                contract: this.contractAddress,
                method: 'proposeRebalance',
                parameters: {
                    pools: strategy.pools.map(p => p.poolAddress),
                    ratios: strategy.pools.map(p => p.allocation),
                    reason: this.generateReason(strategy)
                },
                gasLimit: '500000',
                priority: 'medium',
                timestamp: Date.now()
            };
            
            // Send intent to ASI:One (simulated for demo)
            const response = await this.sendASIIntent(intent);
            
            return {
                intentId: response.intentId || `intent_${Date.now()}`,
                intent: intent,
                status: 'created'
            };

        } catch (error) {
            console.error('❌ Error creating ASI intent:', error.message);
            // Fallback to direct execution
            return {
                intentId: `fallback_${Date.now()}`,
                intent: null,
                status: 'fallback'
            };
        }
    }

    /**
     * Send intent to ASI:One API
     */
    async sendASIIntent(intent) {
        try {
            const response = await axios.post(`${this.asiApiUrl}/intents`, intent, {
                headers: {
                    'Authorization': `Bearer ${this.asiApiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            return response.data;
        } catch (error) {
            console.warn('⚠️ ASI:One API unavailable, using fallback execution');
            return { intentId: null };
        }
    }

    /**
     * Execute the transaction
     */
    async executeTransaction(strategy, intent) {
        try {
            const pools = strategy.pools.map(p => p.poolAddress);
            const ratios = strategy.pools.map(p => p.allocation);
            const reason = this.generateReason(strategy);
            
            console.log(`📝 Proposing rebalance: ${pools.length} pools, reason: ${reason}`);
            
            // Propose the rebalance
            const tx = await this.contract.proposeRebalance(pools, ratios, reason);
            console.log(`⏳ Transaction submitted: ${tx.hash}`);
            
            // Wait for confirmation
            const receipt = await tx.wait();
            console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
            
            // Extract proposal ID from events
            const proposalId = this.extractProposalId(receipt);
            
            // Execute the proposal (in a real scenario, this might be done by the owner)
            let executionResult = null;
            if (this.config.autoExecute) {
                executionResult = await this.executeProposal(proposalId);
            }
            
            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                proposalId: proposalId,
                executionResult: executionResult,
                gasUsed: receipt.gasUsed.toString(),
                intentId: intent.intentId
            };

        } catch (error) {
            console.error('❌ Transaction failed:', error.message);
            return {
                success: false,
                error: error.message,
                intentId: intent.intentId
            };
        }
    }

    /**
     * Extract proposal ID from transaction receipt
     */
    extractProposalId(receipt) {
        const event = receipt.logs.find(log => {
            try {
                const parsed = this.contract.interface.parseLog(log);
                return parsed.name === 'RebalanceProposed';
            } catch {
                return false;
            }
        });
        
        if (event) {
            const parsed = this.contract.interface.parseLog(event);
            return parsed.args.proposalId.toString();
        }
        
        return null;
    }

    /**
     * Execute a rebalance proposal
     */
    async executeProposal(proposalId) {
        try {
            console.log(`🔄 Executing proposal ${proposalId}...`);
            
            const tx = await this.contract.executeRebalance(proposalId);
            const receipt = await tx.wait();
            
            console.log(`✅ Proposal executed in block ${receipt.blockNumber}`);
            
            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };

        } catch (error) {
            console.error(`❌ Failed to execute proposal ${proposalId}:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate human-readable reason for the rebalance
     */
    generateReason(strategy) {
        const reasons = [];
        
        if (strategy.reasoning && strategy.reasoning.suggestions) {
            strategy.reasoning.suggestions.forEach(suggestion => {
                switch (suggestion.action) {
                    case 'reduce_risk':
                        reasons.push('Risk reduction due to high volatility');
                        break;
                    case 'optimize_yield':
                        reasons.push('Yield optimization for better returns');
                        break;
                    case 'diversify':
                        reasons.push('Portfolio diversification');
                        break;
                    case 'increase_allocation':
                        reasons.push('Increased allocation to high-volume pools');
                        break;
                }
            });
        }
        
        if (reasons.length === 0) {
            reasons.push('Automated rebalancing based on market conditions');
        }
        
        return reasons.join('; ');
    }

    /**
     * Get execution history
     */
    getExecutionHistory(limit = 10) {
        return this.executionHistory.slice(-limit);
    }

    /**
     * Get pending proposals
     */
    async getPendingProposals() {
        try {
            const proposalCount = await this.contract.getProposalCount();
            const proposals = [];
            
            for (let i = 0; i < proposalCount; i++) {
                const proposal = await this.contract.getRebalanceProposal(i);
                if (!proposal.executed) {
                    proposals.push({
                        id: i,
                        pools: proposal.pools,
                        ratios: proposal.ratios,
                        timestamp: proposal.timestamp,
                        reason: proposal.reason
                    });
                }
            }
            
            return proposals;
        } catch (error) {
            console.error('❌ Error fetching pending proposals:', error.message);
            return [];
        }
    }

    /**
     * Monitor contract events
     */
    async startEventMonitoring() {
        console.log('👂 Starting event monitoring...');
        
        // Listen for RebalanceProposed events
        this.contract.on('RebalanceProposed', (proposalId, pools, ratios, reason, event) => {
            console.log(`📢 New rebalance proposed: ID ${proposalId}, reason: ${reason}`);
        });
        
        // Listen for RebalanceExecuted events
        this.contract.on('RebalanceExecuted', (proposalId, pools, ratios, event) => {
            console.log(`✅ Rebalance executed: ID ${proposalId}`);
        });
    }

    /**
     * Stop event monitoring
     */
    stopEventMonitoring() {
        this.contract.removeAllListeners();
        console.log('🔇 Event monitoring stopped');
    }
}

module.exports = ExecutorAgent;
