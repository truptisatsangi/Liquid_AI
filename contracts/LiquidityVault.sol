// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LiquidityVault
 * @notice AI-driven liquidity orchestration vault that manages DEX pool allocations
 * @author LiquidAI Team
 */
contract LiquidityVault is ReentrancyGuard, Ownable {
    // Pool allocation mapping: pool address => allocation percentage (basis points)
    mapping(address => uint256) public poolAllocations;
    
    // Total allocation must equal 10000 (100%)
    uint256 public constant TOTAL_ALLOCATION = 10000;
    
    // Agent authority that can propose rebalances
    address public agentAuthority;
    
    // Rebalance proposal structure
    struct RebalanceProposal {
        address[] pools;
        uint256[] ratios;
        uint256 timestamp;
        bool executed;
        string reason;
    }
    
    // Array of all rebalance proposals
    RebalanceProposal[] public rebalanceProposals;
    
    event RebalanceProposed(
        uint256 indexed proposalId,
        address[] pools,
        uint256[] ratios,
        string reason
    );
    
    event RebalanceExecuted(
        uint256 indexed proposalId,
        address[] pools,
        uint256[] ratios
    );
    
    event AgentAuthorityUpdated(address indexed oldAuthority, address indexed newAuthority);
    
    // Modifiers
    modifier onlyAgent() {
        require(msg.sender == agentAuthority, "LiquidityVault: Not authorized agent");
        _;
    }
    
    modifier validAllocation(uint256[] calldata ratios) {
        uint256 total = 0;
        for (uint256 i = 0; i < ratios.length; i++) {
            total += ratios[i];
        }
        require(total == TOTAL_ALLOCATION, "LiquidityVault: Invalid total allocation");
        _;
    }
    
    constructor(address _agentAuthority) Ownable(msg.sender) {
        agentAuthority = _agentAuthority;
        emit AgentAuthorityUpdated(address(0), _agentAuthority);
    }
    
    /**
     * @notice Propose a rebalance of liquidity across pools
     * @param pools Array of pool addresses
     * @param ratios Array of allocation ratios (in basis points)
     * @param reason Human-readable reason for the rebalance
     */
    function proposeRebalance(
        address[] calldata pools,
        uint256[] calldata ratios,
        string calldata reason
    ) external onlyAgent validAllocation(ratios) returns (uint256) {
        require(pools.length == ratios.length, "LiquidityVault: Mismatched inputs");
        require(pools.length > 0, "LiquidityVault: Empty pools array");
        
        uint256 proposalId = rebalanceProposals.length;
        
        rebalanceProposals.push(RebalanceProposal({
            pools: pools,
            ratios: ratios,
            timestamp: block.timestamp,
            executed: false,
            reason: reason
        }));
        
        emit RebalanceProposed(proposalId, pools, ratios, reason);
        
        return proposalId;
    }
    
    /**
     * @notice Execute a rebalance proposal
     * @param proposalId ID of the proposal to execute
     */
    function executeRebalance(uint256 proposalId) external onlyOwner nonReentrant {
        require(proposalId < rebalanceProposals.length, "LiquidityVault: Invalid proposal ID");
        
        RebalanceProposal storage proposal = rebalanceProposals[proposalId];
        require(!proposal.executed, "LiquidityVault: Proposal already executed");
        
        // Update pool allocations
        for (uint256 i = 0; i < proposal.pools.length; i++) {
            poolAllocations[proposal.pools[i]] = proposal.ratios[i];
        }
        
        proposal.executed = true;
        
        emit RebalanceExecuted(proposalId, proposal.pools, proposal.ratios);
    }
    
    /**
     * @notice Update the agent authority address
     * @param newAuthority New agent authority address
     */
    function updateAgentAuthority(address newAuthority) external onlyOwner {
        require(newAuthority != address(0), "LiquidityVault: Invalid authority address");
        address oldAuthority = agentAuthority;
        agentAuthority = newAuthority;
        emit AgentAuthorityUpdated(oldAuthority, newAuthority);
    }
    
    /**
     * @notice Get the current allocation for a specific pool
     * @param pool Pool address
     * @return allocation Allocation percentage in basis points
     */
    function getPoolAllocation(address pool) external view returns (uint256) {
        return poolAllocations[pool];
    }
    
    /**
     * @notice Get all pool allocations
     * @return pools Array of pool addresses
     * @return allocations Array of allocation percentages
     */
    function getAllPoolAllocations() external view returns (address[] memory pools, uint256[] memory allocations) {
        // This is a simplified version - in production, you'd want to track active pools
        // For now, we'll return empty arrays as this would require additional storage
        pools = new address[](0);
        allocations = new uint256[](0);
    }
    
    /**
     * @notice Get rebalance proposal details
     * @param proposalId Proposal ID
     * @return proposal RebalanceProposal struct
     */
    function getRebalanceProposal(uint256 proposalId) external view returns (RebalanceProposal memory) {
        require(proposalId < rebalanceProposals.length, "LiquidityVault: Invalid proposal ID");
        return rebalanceProposals[proposalId];
    }
    
    /**
     * @notice Get total number of rebalance proposals
     * @return count Number of proposals
     */
    function getProposalCount() external view returns (uint256) {
        return rebalanceProposals.length;
    }
    
    /**
     * @notice Emergency function to pause the contract (inherited from Ownable)
     */
    function emergencyPause() external onlyOwner {
        // Implementation would depend on your specific needs
        // This is a placeholder for emergency functionality
    }
}
