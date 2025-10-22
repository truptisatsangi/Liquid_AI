/**
 * Deployment Script for LiquidAI
 * Deploys LiquidityVault contract and sets up initial configuration
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class LiquidAIDeployer {
    constructor(config) {
        this.config = config;
        this.rpcUrl = config.rpcUrl;
        this.privateKey = config.privateKey;
        this.chainId = config.chainId;
        
        // Initialize provider and wallet
        this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
        this.wallet = new ethers.Wallet(this.privateKey, this.provider);
        
        // Contract ABI and bytecode (would be loaded from compiled artifacts)
        this.liquidityVaultABI = [
            "constructor(address _agentAuthority)",
            "function proposeRebalance(address[] calldata pools, uint256[] calldata ratios, string calldata reason) external returns (uint256)",
            "function executeRebalance(uint256 proposalId) external",
            "function updateAgentAuthority(address newAuthority) external",
            "function getPoolAllocation(address pool) external view returns (uint256)",
            "function getProposalCount() external view returns (uint256)",
            "function getRebalanceProposal(uint256 proposalId) external view returns (tuple(address[] pools, uint256[] ratios, uint256 timestamp, bool executed, string reason))",
            "event RebalanceProposed(uint256 indexed proposalId, address[] pools, uint256[] ratios, string reason)",
            "event RebalanceExecuted(uint256 indexed proposalId, address[] pools, uint256[] ratios)",
            "event AgentAuthorityUpdated(address indexed oldAuthority, address indexed newAuthority)"
        ];
        
        // Mock bytecode (in reality, this would be loaded from compiled artifacts)
        this.liquidityVaultBytecode = "0x608060405234801561001057600080fd5b506040516..."; // Truncated for demo
    }

    /**
     * Deploy LiquidityVault contract
     */
    async deployLiquidityVault(agentAuthority = null) {
        try {
            console.log('🚀 Deploying LiquidityVault contract...');
            
            // Use deployer as agent authority if not provided
            if (!agentAuthority) {
                agentAuthority = this.wallet.address;
            }
            
            console.log(`📋 Agent Authority: ${agentAuthority}`);
            
            // Create contract factory
            const LiquidityVaultFactory = new ethers.ContractFactory(
                this.liquidityVaultABI,
                this.liquidityVaultBytecode,
                this.wallet
            );
            
            // Deploy contract
            console.log('⏳ Deploying contract...');
            const liquidityVault = await LiquidityVaultFactory.deploy(agentAuthority);
            
            console.log(`⏳ Transaction submitted: ${liquidityVault.deploymentTransaction().hash}`);
            
            // Wait for deployment
            await liquidityVault.waitForDeployment();
            const contractAddress = await liquidityVault.getAddress();
            
            console.log(`✅ LiquidityVault deployed successfully!`);
            console.log(`📍 Contract Address: ${contractAddress}`);
            console.log(`🔗 Transaction Hash: ${liquidityVault.deploymentTransaction().hash}`);
            
            // Verify deployment
            const code = await this.provider.getCode(contractAddress);
            if (code === '0x') {
                throw new Error('Contract deployment verification failed');
            }
            
            return {
                contractAddress,
                transactionHash: liquidityVault.deploymentTransaction().hash,
                contract: liquidityVault
            };
            
        } catch (error) {
            console.error('❌ Error deploying LiquidityVault:', error.message);
            throw error;
        }
    }

    /**
     * Verify contract deployment
     */
    async verifyContract(contractAddress, constructorArgs = []) {
        try {
            console.log('🔍 Verifying contract deployment...');
            
            // Check if contract exists
            const code = await this.provider.getCode(contractAddress);
            if (code === '0x') {
                throw new Error('Contract not found at address');
            }
            
            // Test basic functionality
            const contract = new ethers.Contract(contractAddress, this.liquidityVaultABI, this.wallet);
            
            // Test getProposalCount
            const proposalCount = await contract.getProposalCount();
            console.log(`📊 Initial proposal count: ${proposalCount}`);
            
            // Test agent authority
            const agentAuthority = await contract.agentAuthority();
            console.log(`👤 Agent authority: ${agentAuthority}`);
            
            console.log('✅ Contract verification successful');
            
            return {
                verified: true,
                contractAddress,
                proposalCount: Number(proposalCount),
                agentAuthority
            };
            
        } catch (error) {
            console.error('❌ Contract verification failed:', error.message);
            throw error;
        }
    }

    /**
     * Test contract functionality
     */
    async testContract(contractAddress) {
        try {
            console.log('🧪 Testing contract functionality...');
            
            const contract = new ethers.Contract(contractAddress, this.liquidityVaultABI, this.wallet);
            
            // Test 1: Propose a rebalance
            console.log('📝 Testing rebalance proposal...');
            const testPools = [
                '0x1234567890123456789012345678901234567890',
                '0x2345678901234567890123456789012345678901'
            ];
            const testRatios = [6000, 4000]; // 60% and 40%
            const testReason = 'Test rebalance for deployment verification';
            
            const tx = await contract.proposeRebalance(testPools, testRatios, testReason);
            console.log(`⏳ Proposal transaction: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ Proposal submitted in block ${receipt.blockNumber}`);
            
            // Test 2: Get proposal count
            const proposalCount = await contract.getProposalCount();
            console.log(`📊 Proposal count after test: ${proposalCount}`);
            
            // Test 3: Get proposal details
            const proposal = await contract.getRebalanceProposal(0);
            console.log(`📋 Test proposal reason: ${proposal.reason}`);
            
            console.log('✅ Contract functionality test successful');
            
            return {
                success: true,
                proposalId: 0,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };
            
        } catch (error) {
            console.error('❌ Contract functionality test failed:', error.message);
            throw error;
        }
    }

    /**
     * Save deployment information
     */
    async saveDeploymentInfo(deploymentInfo) {
        try {
            const deploymentData = {
                network: this.getNetworkName(),
                chainId: this.chainId,
                contractAddress: deploymentInfo.contractAddress,
                transactionHash: deploymentInfo.transactionHash,
                deployer: this.wallet.address,
                timestamp: new Date().toISOString(),
                agentAuthority: await this.getAgentAuthority(deploymentInfo.contractAddress)
            };
            
            const deploymentPath = path.join(__dirname, '..', 'deployments', `${this.getNetworkName()}.json`);
            
            // Ensure deployments directory exists
            const deploymentsDir = path.dirname(deploymentPath);
            if (!fs.existsSync(deploymentsDir)) {
                fs.mkdirSync(deploymentsDir, { recursive: true });
            }
            
            // Save deployment info
            fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
            
            console.log(`💾 Deployment info saved to: ${deploymentPath}`);
            
            return deploymentData;
            
        } catch (error) {
            console.error('❌ Error saving deployment info:', error.message);
            throw error;
        }
    }

    /**
     * Get network name
     */
    getNetworkName() {
        switch (this.chainId) {
            case 1: return 'mainnet';
            case 11155111: return 'sepolia';
            case 31337: return 'hardhat';
            default: return `chain-${this.chainId}`;
        }
    }

    /**
     * Get agent authority from contract
     */
    async getAgentAuthority(contractAddress) {
        try {
            const contract = new ethers.Contract(contractAddress, this.liquidityVaultABI, this.wallet);
            return await contract.agentAuthority();
        } catch (error) {
            console.error('❌ Error getting agent authority:', error.message);
            return null;
        }
    }

    /**
     * Full deployment process
     */
    async deploy() {
        try {
            console.log('🚀 Starting LiquidAI deployment...');
            console.log(`🌐 Network: ${this.getNetworkName()} (Chain ID: ${this.chainId})`);
            console.log(`👤 Deployer: ${this.wallet.address}`);
            
            // Check wallet balance
            const balance = await this.provider.getBalance(this.wallet.address);
            console.log(`💰 Wallet balance: ${ethers.formatEther(balance)} ETH`);
            
            if (balance < ethers.parseEther('0.01')) {
                console.warn('⚠️ Low wallet balance - deployment may fail');
            }
            
            // Deploy contract
            const deploymentInfo = await this.deployLiquidityVault();
            
            // Verify deployment
            await this.verifyContract(deploymentInfo.contractAddress);
            
            // Test functionality
            await this.testContract(deploymentInfo.contractAddress);
            
            // Save deployment info
            const savedInfo = await this.saveDeploymentInfo(deploymentInfo);
            
            console.log('\n🎉 Deployment completed successfully!');
            console.log('📋 Deployment Summary:');
            console.log(`   Contract Address: ${savedInfo.contractAddress}`);
            console.log(`   Network: ${savedInfo.network}`);
            console.log(`   Deployer: ${savedInfo.deployer}`);
            console.log(`   Agent Authority: ${savedInfo.agentAuthority}`);
            console.log(`   Timestamp: ${savedInfo.timestamp}`);
            
            return savedInfo;
            
        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
            throw error;
        }
    }
}

// CLI interface
if (require.main === module) {
    const config = {
        rpcUrl: process.env.SEPOLIA_RPC_URL || 'http://localhost:8545',
        privateKey: process.env.PRIVATE_KEY || '',
        chainId: parseInt(process.env.CHAIN_ID) || 11155111 // Sepolia
    };
    
    const deployer = new LiquidAIDeployer(config);
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'deploy';
    
    async function runCommand() {
        try {
            switch (command) {
                case 'deploy':
                    await deployer.deploy();
                    break;
                    
                case 'verify':
                    const contractAddress = args[1];
                    if (!contractAddress) {
                        throw new Error('Contract address required for verification');
                    }
                    await deployer.verifyContract(contractAddress);
                    break;
                    
                case 'test':
                    const testAddress = args[1];
                    if (!testAddress) {
                        throw new Error('Contract address required for testing');
                    }
                    await deployer.testContract(testAddress);
                    break;
                    
                default:
                    console.log('Usage: node deploy.js [deploy|verify|test] [contractAddress]');
                    console.log('Examples:');
                    console.log('  node deploy.js deploy');
                    console.log('  node deploy.js verify 0x...');
                    console.log('  node deploy.js test 0x...');
            }
        } catch (error) {
            console.error('❌ Command failed:', error.message);
            process.exit(1);
        }
    }
    
    runCommand();
}

module.exports = LiquidAIDeployer;
