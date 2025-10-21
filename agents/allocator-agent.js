/**
 * AllocatorAgent - Uses MeTTa logic to reason about reallocation decisions
 * Analyzes market conditions and generates optimal allocation strategies
 */

const axios = require('axios');

class AllocatorAgent {
    constructor(config) {
        this.config = config;
        this.mettaEndpoint = config.mettaEndpoint;
        this.mettaApiKey = config.mettaApiKey;
        this.currentAllocations = new Map();
        this.allocationHistory = [];
    }

    /**
     * Start the allocator agent
     */
    async start() {
        console.log('🧠 AllocatorAgent starting...');
        
        // Initialize with default allocations
        this.initializeDefaultAllocations();
        
        console.log('✅ AllocatorAgent started successfully');
    }

    /**
     * Analyze market conditions and generate allocation strategy
     * @param {Object} marketData - Market data from ObserverAgent
     * @returns {Object} Allocation strategy
     */
    async analyzeAndAllocate(marketData) {
        try {
            console.log('🔍 Analyzing market conditions for allocation...');

            // Use MeTTa logic to reason about allocations
            const mettaReasoning = await this.runMettaLogic(marketData);
            
            // Generate allocation strategy
            const allocationStrategy = this.generateAllocationStrategy(marketData, mettaReasoning);
            
            // Validate and optimize the strategy
            const optimizedStrategy = this.optimizeStrategy(allocationStrategy);
            
            // Store in history
            this.allocationHistory.push({
                timestamp: Date.now(),
                marketData,
                strategy: optimizedStrategy,
                reasoning: mettaReasoning
            });

            console.log('✅ Allocation analysis completed');
            return optimizedStrategy;

        } catch (error) {
            console.error('❌ Error in allocation analysis:', error.message);
            throw error;
        }
    }

    /**
     * Run MeTTa logic for decision making
     * @param {Object} marketData - Market conditions
     * @returns {Object} MeTTa reasoning results
     */
    async runMettaLogic(marketData) {
        try {
            // MeTTa-style conditional logic for allocation decisions
            const mettaRules = this.buildMettaRules(marketData);
            
            // Execute MeTTa reasoning (simulated for this demo)
            const reasoning = this.executeMettaReasoning(mettaRules, marketData);
            
            return reasoning;

        } catch (error) {
            console.error('❌ Error in MeTTa logic:', error.message);
            // Fallback to simple rule-based logic
            return this.fallbackReasoning(marketData);
        }
    }

    /**
     * Build MeTTa rules based on market conditions
     */
    buildMettaRules(marketData) {
        const rules = [];

        // Rule 1: High volatility management
        rules.push({
            condition: `(> volatility ${marketData.marketVolatility})`,
            threshold: 0.6,
            action: 'reduce_risk',
            logic: `(if (> volatility 0.6) (suggest "move 20% from volatile pool to stable"))`
        });

        // Rule 2: Low yield optimization
        rules.push({
            condition: `(< feeAPR ${marketData.averageAPR})`,
            threshold: 0.03,
            action: 'optimize_yield',
            logic: `(if (< feeAPR 0.03) (suggest "withdraw and reallocate to higher-yield"))`
        });

        // Rule 3: TVL concentration management
        rules.push({
            condition: `(> concentration 0.7)`,
            threshold: 0.7,
            action: 'diversify',
            logic: `(if (> concentration 0.7) (suggest "diversify across more pools"))`
        });

        // Rule 4: Volume-based allocation
        rules.push({
            condition: `(> volume24h 100000)`,
            threshold: 100000,
            action: 'increase_allocation',
            logic: `(if (> volume24h 100000) (suggest "increase allocation to high-volume pools"))`
        });

        return rules;
    }

    /**
     * Execute MeTTa reasoning (simulated)
     */
    executeMettaReasoning(rules, marketData) {
        const reasoning = {
            triggeredRules: [],
            suggestions: [],
            confidence: 0.8,
            reasoning: []
        };

        rules.forEach(rule => {
            const isTriggered = this.evaluateCondition(rule.condition, marketData);
            
            if (isTriggered) {
                reasoning.triggeredRules.push(rule);
                reasoning.suggestions.push({
                    action: rule.action,
                    logic: rule.logic,
                    priority: this.calculatePriority(rule, marketData)
                });
                
                reasoning.reasoning.push(`Rule triggered: ${rule.logic}`);
            }
        });

        // Calculate overall confidence
        reasoning.confidence = this.calculateConfidence(reasoning.triggeredRules, marketData);

        return reasoning;
    }

    /**
     * Evaluate MeTTa condition
     */
    evaluateCondition(condition, marketData) {
        // Simplified condition evaluation
        // In a real MeTTa implementation, this would be more sophisticated
        
        if (condition.includes('volatility')) {
            const threshold = parseFloat(condition.match(/\d+\.?\d*/)[0]);
            return marketData.marketVolatility > threshold;
        }
        
        if (condition.includes('feeAPR')) {
            const threshold = parseFloat(condition.match(/\d+\.?\d*/)[0]);
            return marketData.averageAPR < threshold;
        }
        
        if (condition.includes('volume24h')) {
            const threshold = parseFloat(condition.match(/\d+/)[0]);
            const totalVolume = Object.values(marketData.pools).reduce((sum, pool) => sum + pool.volume24h, 0);
            return totalVolume > threshold;
        }
        
        return false;
    }

    /**
     * Calculate priority for a rule
     */
    calculatePriority(rule, marketData) {
        let priority = 'medium';
        
        if (rule.action === 'reduce_risk' && marketData.marketVolatility > 0.8) {
            priority = 'high';
        } else if (rule.action === 'optimize_yield' && marketData.averageAPR < 0.02) {
            priority = 'high';
        } else if (rule.action === 'diversify') {
            priority = 'medium';
        } else {
            priority = 'low';
        }
        
        return priority;
    }

    /**
     * Calculate confidence in the reasoning
     */
    calculateConfidence(triggeredRules, marketData) {
        let confidence = 0.5; // Base confidence
        
        // Increase confidence based on number of triggered rules
        confidence += triggeredRules.length * 0.1;
        
        // Increase confidence based on data quality
        if (marketData.pools && Object.keys(marketData.pools).length > 0) {
            confidence += 0.2;
        }
        
        // Cap at 1.0
        return Math.min(confidence, 1.0);
    }

    /**
     * Generate allocation strategy based on MeTTa reasoning
     */
    generateAllocationStrategy(marketData, mettaReasoning) {
        const strategy = {
            timestamp: Date.now(),
            pools: [],
            totalAllocation: 10000, // 100% in basis points
            reasoning: mettaReasoning,
            confidence: mettaReasoning.confidence
        };

        // Get current pool addresses
        const poolAddresses = Object.keys(marketData.pools);
        
        if (poolAddresses.length === 0) {
            return strategy;
        }

        // Apply MeTTa suggestions to generate allocations
        const allocations = this.applyMettaSuggestions(poolAddresses, marketData, mettaReasoning);
        
        strategy.pools = allocations;
        
        return strategy;
    }

    /**
     * Apply MeTTa suggestions to generate specific allocations
     */
    applyMettaSuggestions(poolAddresses, marketData, mettaReasoning) {
        const allocations = [];
        const baseAllocation = 10000 / poolAddresses.length; // Equal distribution
        
        poolAddresses.forEach(poolAddress => {
            let allocation = baseAllocation;
            const poolData = marketData.pools[poolAddress];
            
            // Apply MeTTa suggestions
            mettaReasoning.suggestions.forEach(suggestion => {
                switch (suggestion.action) {
                    case 'reduce_risk':
                        if (poolData.feeAPR < 0.02) { // Low APR = more stable
                            allocation *= 1.2; // Increase allocation to stable pools
                        } else {
                            allocation *= 0.8; // Decrease allocation to volatile pools
                        }
                        break;
                        
                    case 'optimize_yield':
                        if (poolData.feeAPR > 0.05) { // High APR
                            allocation *= 1.3; // Increase allocation to high-yield pools
                        } else if (poolData.feeAPR < 0.02) {
                            allocation *= 0.5; // Decrease allocation to low-yield pools
                        }
                        break;
                        
                    case 'increase_allocation':
                        if (poolData.volume24h > 100000) {
                            allocation *= 1.1; // Increase allocation to high-volume pools
                        }
                        break;
                }
            });
            
            allocations.push({
                poolAddress,
                allocation: Math.round(allocation),
                reason: this.generateAllocationReason(poolData, mettaReasoning)
            });
        });
        
        // Normalize allocations to sum to 10000
        return this.normalizeAllocations(allocations);
    }

    /**
     * Generate reason for allocation decision
     */
    generateAllocationReason(poolData, mettaReasoning) {
        const reasons = [];
        
        if (poolData.feeAPR > 0.05) {
            reasons.push('High APR');
        }
        if (poolData.volume24h > 100000) {
            reasons.push('High volume');
        }
        if (poolData.tvlUSD > 1000000) {
            reasons.push('Large TVL');
        }
        
        return reasons.join(', ') || 'Balanced allocation';
    }

    /**
     * Normalize allocations to sum to 10000 (100%)
     */
    normalizeAllocations(allocations) {
        const total = allocations.reduce((sum, alloc) => sum + alloc.allocation, 0);
        const factor = 10000 / total;
        
        return allocations.map(alloc => ({
            ...alloc,
            allocation: Math.round(alloc.allocation * factor)
        }));
    }

    /**
     * Optimize the allocation strategy
     */
    optimizeStrategy(strategy) {
        // Add optimization logic here
        // For now, just validate the strategy
        const totalAllocation = strategy.pools.reduce((sum, pool) => sum + pool.allocation, 0);
        
        if (totalAllocation !== 10000) {
            console.warn(`⚠️ Total allocation is ${totalAllocation}, expected 10000`);
        }
        
        return strategy;
    }

    /**
     * Initialize default allocations
     */
    initializeDefaultAllocations() {
        // Default equal distribution across available pools
        this.currentAllocations.set('default', {
            timestamp: Date.now(),
            pools: [],
            totalAllocation: 10000
        });
    }

    /**
     * Fallback reasoning when MeTTa is unavailable
     */
    fallbackReasoning(marketData) {
        return {
            triggeredRules: [],
            suggestions: [{
                action: 'maintain_current',
                logic: '(suggest "maintain current allocation due to insufficient data")',
                priority: 'low'
            }],
            confidence: 0.3,
            reasoning: ['Fallback reasoning: insufficient market data']
        };
    }

    /**
     * Get allocation history
     */
    getAllocationHistory(limit = 10) {
        return this.allocationHistory.slice(-limit);
    }
}

module.exports = AllocatorAgent;
