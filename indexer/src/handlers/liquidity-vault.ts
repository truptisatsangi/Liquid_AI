import { RebalanceProposed, RebalanceExecuted, AgentAuthorityUpdated } from "../../generated/LiquidityVault/LiquidityVault";
import { RebalanceEvent, AgentAction } from "../../generated/schema";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

/**
 * Handle RebalanceProposed events from LiquidityVault
 */
export function handleRebalanceProposed(event: RebalanceProposed): void {
  let rebalanceEvent = new RebalanceEvent(event.params.proposalId.toString());
  
  rebalanceEvent.proposalId = event.params.proposalId;
  rebalanceEvent.pools = event.params.pools.map<string>((pool) => pool.toHexString());
  rebalanceEvent.ratios = event.params.ratios;
  rebalanceEvent.reason = event.params.reason;
  rebalanceEvent.timestamp = event.block.timestamp.toI32();
  rebalanceEvent.executed = false;
  rebalanceEvent.executedAt = null;
  rebalanceEvent.executor = null;
  rebalanceEvent.transactionHash = event.transaction.hash.toHexString();
  rebalanceEvent.blockNumber = event.block.number;
  rebalanceEvent.gasUsed = null;
  
  rebalanceEvent.save();
  
  // Create agent action record
  let agentAction = new AgentAction(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  
  agentAction.agentType = "allocator";
  agentAction.action = "propose_rebalance";
  agentAction.parameters = JSON.stringify({
    pools: event.params.pools.map<string>((pool) => pool.toHexString()),
    ratios: event.params.ratios.map<string>((ratio) => ratio.toString()),
    reason: event.params.reason
  });
  agentAction.result = JSON.stringify({
    proposalId: event.params.proposalId.toString(),
    success: true
  });
  agentAction.confidence = 0.8; // Default confidence
  agentAction.timestamp = event.block.timestamp.toI32();
  agentAction.blockNumber = event.block.number;
  agentAction.success = true;
  
  agentAction.save();
}

/**
 * Handle RebalanceExecuted events from LiquidityVault
 */
export function handleRebalanceExecuted(event: RebalanceExecuted): void {
  let rebalanceEvent = RebalanceEvent.load(event.params.proposalId.toString());
  
  if (rebalanceEvent) {
    rebalanceEvent.executed = true;
    rebalanceEvent.executedAt = event.block.timestamp.toI32();
    rebalanceEvent.executor = event.transaction.from.toHexString();
    rebalanceEvent.transactionHash = event.transaction.hash.toHexString();
    rebalanceEvent.gasUsed = event.receipt ? event.receipt.gasUsed : null;
    
    rebalanceEvent.save();
    
    // Create agent action record
    let agentAction = new AgentAction(
      event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
    );
    
    agentAction.agentType = "executor";
    agentAction.action = "execute_rebalance";
    agentAction.parameters = JSON.stringify({
      proposalId: event.params.proposalId.toString()
    });
    agentAction.result = JSON.stringify({
      success: true,
      gasUsed: event.receipt ? event.receipt.gasUsed.toString() : null
    });
    agentAction.confidence = 1.0; // Execution is always confident
    agentAction.timestamp = event.block.timestamp.toI32();
    agentAction.blockNumber = event.block.number;
    agentAction.success = true;
    
    agentAction.save();
  }
}

/**
 * Handle AgentAuthorityUpdated events from LiquidityVault
 */
export function handleAgentAuthorityUpdated(event: AgentAuthorityUpdated): void {
  // Create agent action record for authority update
  let agentAction = new AgentAction(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  
  agentAction.agentType = "system";
  agentAction.action = "update_authority";
  agentAction.parameters = JSON.stringify({
    oldAuthority: event.params.oldAuthority.toHexString(),
    newAuthority: event.params.newAuthority.toHexString()
  });
  agentAction.result = JSON.stringify({
    success: true
  });
  agentAction.confidence = 1.0;
  agentAction.timestamp = event.block.timestamp.toI32();
  agentAction.blockNumber = event.block.number;
  agentAction.success = true;
  
  agentAction.save();
}
