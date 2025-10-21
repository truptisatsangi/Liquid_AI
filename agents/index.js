/**
 * LiquidAI Agent Orchestrator
 * Coordinates ObserverAgent, AllocatorAgent, and ExecutorAgent
 */

const ObserverAgent = require('./observer-agent');
const AllocatorAgent = require('./allocator-agent');
const ExecutorAgent = require('./executor-agent');
require('dotenv').config();

class LiquidAIAgentOrchestrator {
    constructor() {
        this.config = {
            // Envio configuration
            envioApiUrl: process.env.ENVIO_API_URL || 'https://api.envio.dev/graphql',
            envioApiKey: process.env.ENVIO_API_KEY || '',
            
            // Pyth configuration
            pythApiUrl: process.env.PYTH_PRICE_SERVICE_URL || 'https://hermes.pyth.network',
            
            // MeTTa configuration
            mettaEndpoint: process.env.METTA_ENDPOINT || 'https://api.metta.ai',
            mettaApiKey: process.env.METTA_API_KEY || '',
            
            // ASI:One configuration
            asiApiUrl: process.env.ASI_API_URL || 'https://api.asi.one',
            asiApiKey: process.env.ASI_API_KEY || '',
            
            // Ethereum configuration
            rpcUrl: process.env.SEPOLIA_RPC_URL || 'http://localhost:8545',
            privateKey: process.env.PRIVATE_KEY || '',
            contractAddress: process.env.LIQUIDITY_VAULT_ADDRESS || '',
            
            // Pool configuration
            pools: [
                '0x1234567890123456789012345678901234567890',
                '0x2345678901234567890123456789012345678901',
                '0x3456789012345678901234567890123456789012'
            ],
            
            // Execution configuration
            autoExecute: process.env.AUTO_EXECUTE === 'true',
            executionInterval: parseInt(process.env.EXECUTION_INTERVAL) || 300000, // 5 minutes
            minConfidenceThreshold: parseFloat(process.env.MIN_CONFIDENCE_THRESHOLD) || 0.7
        };
        
        this.observer = new ObserverAgent(this.config);
        this.allocator = new AllocatorAgent(this.config);
        this.executor = new ExecutorAgent(this.config);
        
        this.isRunning = false;
        this.executionTimer = null;
    }

    /**
     * Start the LiquidAI agent orchestrator
     */
    async start() {
        try {
            console.log('🚀 Starting LiquidAI Agent Orchestrator...');
            
            // Validate configuration
            this.validateConfig();
            
            // Start individual agents
            await this.observer.start();
            await this.allocator.start();
            await this.executor.start();
            
            // Start event monitoring
            await this.executor.startEventMonitoring();
            
            // Start the main orchestration loop
            this.startOrchestrationLoop();
            
            this.isRunning = true;
            console.log('✅ LiquidAI Agent Orchestrator started successfully');
            
        } catch (error) {
            console.error('❌ Failed to start LiquidAI orchestrator:', error.message);
            throw error;
        }
    }

    /**
     * Stop the LiquidAI agent orchestrator
     */
    async stop() {
        console.log('🛑 Stopping LiquidAI Agent Orchestrator...');
        
        this.isRunning = false;
        
        if (this.executionTimer) {
            clearInterval(this.executionTimer);
        }
        
        this.observer.stop();
        this.executor.stopEventMonitoring();
        
        console.log('✅ LiquidAI Agent Orchestrator stopped');
    }

    /**
     * Start the main orchestration loop
     */
    startOrchestrationLoop() {
        console.log('🔄 Starting orchestration loop...');
        
        // Run orchestration every 5 minutes
        this.executionTimer = setInterval(async () => {
            if (this.isRunning) {
                await this.runOrchestrationCycle();
            }
        }, this.config.executionInterval);
        
        // Run initial cycle
        setTimeout(() => {
            if (this.isRunning) {
                this.runOrchestrationCycle();
            }
        }, 10000); // Wait 10 seconds before first run
    }

    /**
     * Run a single orchestration cycle
     */
    async runOrchestrationCycle() {
        try {
            console.log('\n🔄 Starting orchestration cycle...');
            
            // Step 1: Observe market conditions
            console.log('📊 Step 1: Observing market conditions...');
            const marketData = await this.observer.observeMarkets();
            
            // Step 2: Analyze and generate allocation strategy
            console.log('🧠 Step 2: Analyzing market data and generating strategy...');
            const allocationStrategy = await this.allocator.analyzeAndAllocate(marketData);
            
            // Step 3: Check if strategy meets confidence threshold
            if (allocationStrategy.confidence < this.config.minConfidenceThreshold) {
                console.log(`⚠️ Strategy confidence (${allocationStrategy.confidence}) below threshold (${this.config.minConfidenceThreshold}), skipping execution`);
                return;
            }
            
            // Step 4: Execute the strategy
            console.log('⚡ Step 3: Executing allocation strategy...');
            const executionResult = await this.executor.executeStrategy(allocationStrategy);
            
            // Step 5: Log results
            this.logOrchestrationResults(marketData, allocationStrategy, executionResult);
            
            console.log('✅ Orchestration cycle completed\n');
            
        } catch (error) {
            console.error('❌ Error in orchestration cycle:', error.message);
        }
    }

    /**
     * Log orchestration results
     */
    logOrchestrationResults(marketData, strategy, executionResult) {
        console.log('📋 Orchestration Results:');
        console.log(`   Market Volatility: ${(marketData.marketVolatility * 100).toFixed(2)}%`);
        console.log(`   Average APR: ${(marketData.averageAPR * 100).toFixed(2)}%`);
        console.log(`   Total TVL: $${marketData.totalTVL.toLocaleString()}`);
        console.log(`   Strategy Confidence: ${(strategy.confidence * 100).toFixed(2)}%`);
        console.log(`   Execution Success: ${executionResult.success ? '✅' : '❌'}`);
        
        if (executionResult.success) {
            console.log(`   Transaction Hash: ${executionResult.transactionHash}`);
            console.log(`   Proposal ID: ${executionResult.proposalId}`);
        }
    }

    /**
     * Validate configuration
     */
    validateConfig() {
        const required = ['rpcUrl', 'privateKey', 'contractAddress'];
        const missing = required.filter(key => !this.config[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required configuration: ${missing.join(', ')}`);
        }
        
        console.log('✅ Configuration validated');
    }

    /**
     * Get system status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            config: {
                contractAddress: this.config.contractAddress,
                executionInterval: this.config.executionInterval,
                autoExecute: this.config.autoExecute,
                minConfidenceThreshold: this.config.minConfidenceThreshold
            },
            agents: {
                observer: this.observer.isRunning,
                allocator: true, // Allocator doesn't have a running state
                executor: true   // Executor doesn't have a running state
            }
        };
    }

    /**
     * Get recent observations
     */
    getRecentObservations(count = 5) {
        return this.observer.getLatestObservations(count);
    }

    /**
     * Get allocation history
     */
    getAllocationHistory(limit = 5) {
        return this.allocator.getAllocationHistory(limit);
    }

    /**
     * Get execution history
     */
    getExecutionHistory(limit = 5) {
        return this.executor.getExecutionHistory(limit);
    }

    /**
     * Get pending proposals
     */
    async getPendingProposals() {
        return await this.executor.getPendingProposals();
    }

    /**
     * Manual execution trigger
     */
    async triggerManualExecution() {
        console.log('🔧 Manual execution triggered...');
        await this.runOrchestrationCycle();
    }
}

// CLI interface
if (require.main === module) {
    const orchestrator = new LiquidAIAgentOrchestrator();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        await orchestrator.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        await orchestrator.stop();
        process.exit(0);
    });
    
    // Start the orchestrator
    orchestrator.start().catch(error => {
        console.error('❌ Failed to start orchestrator:', error);
        process.exit(1);
    });
}

module.exports = LiquidAIAgentOrchestrator;
