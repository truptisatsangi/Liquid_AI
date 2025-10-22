const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LiquidityVault", function () {
  let liquidityVault;
  let owner;
  let agentAuthority;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, agentAuthority, addr1, addr2] = await ethers.getSigners();
    
    const LiquidityVault = await ethers.getContractFactory("LiquidityVault");
    liquidityVault = await LiquidityVault.deploy(agentAuthority.address);
    await liquidityVault.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await liquidityVault.owner()).to.equal(owner.address);
    });

    it("Should set the right agent authority", async function () {
      expect(await liquidityVault.agentAuthority()).to.equal(agentAuthority.address);
    });

    it("Should have zero initial proposals", async function () {
      expect(await liquidityVault.getProposalCount()).to.equal(0);
    });
  });

  describe("Rebalance Proposals", function () {
    it("Should allow agent to propose rebalance", async function () {
      const pools = [addr1.address, addr2.address];
      const ratios = [6000, 4000]; // 60% and 40%
      const reason = "Test rebalance proposal";

      await expect(liquidityVault.connect(agentAuthority).proposeRebalance(pools, ratios, reason))
        .to.emit(liquidityVault, "RebalanceProposed")
        .withArgs(0, pools, ratios, reason);

      expect(await liquidityVault.getProposalCount()).to.equal(1);
    });

    it("Should reject proposal from non-agent", async function () {
      const pools = [addr1.address, addr2.address];
      const ratios = [6000, 4000];
      const reason = "Unauthorized proposal";

      await expect(
        liquidityVault.connect(addr1).proposeRebalance(pools, ratios, reason)
      ).to.be.revertedWith("LiquidityVault: Not authorized agent");
    });

    it("Should reject proposal with invalid total allocation", async function () {
      const pools = [addr1.address, addr2.address];
      const ratios = [6000, 3000]; // Total: 90% (should be 100%)
      const reason = "Invalid allocation";

      await expect(
        liquidityVault.connect(agentAuthority).proposeRebalance(pools, ratios, reason)
      ).to.be.revertedWith("LiquidityVault: Invalid total allocation");
    });

    it("Should reject proposal with mismatched arrays", async function () {
      const pools = [addr1.address, addr2.address];
      const ratios = [6000]; // Only one ratio for two pools
      const reason = "Mismatched arrays";

      await expect(
        liquidityVault.connect(agentAuthority).proposeRebalance(pools, ratios, reason)
      ).to.be.revertedWith("LiquidityVault: Invalid total allocation");
    });
  });

  describe("Rebalance Execution", function () {
    beforeEach(async function () {
      const pools = [addr1.address, addr2.address];
      const ratios = [6000, 4000];
      const reason = "Test execution";

      await liquidityVault.connect(agentAuthority).proposeRebalance(pools, ratios, reason);
    });

    it("Should allow owner to execute rebalance", async function () {
      await expect(liquidityVault.connect(owner).executeRebalance(0))
        .to.emit(liquidityVault, "RebalanceExecuted")
        .withArgs(0, [addr1.address, addr2.address], [6000, 4000]);

      const proposal = await liquidityVault.getRebalanceProposal(0);
      expect(proposal.executed).to.be.true;
    });

    it("Should reject execution from non-owner", async function () {
      await expect(
        liquidityVault.connect(addr1).executeRebalance(0)
      ).to.be.revertedWithCustomError(liquidityVault, "OwnableUnauthorizedAccount");
    });

    it("Should reject execution of non-existent proposal", async function () {
      await expect(
        liquidityVault.connect(owner).executeRebalance(1)
      ).to.be.revertedWith("LiquidityVault: Invalid proposal ID");
    });

    it("Should reject double execution", async function () {
      await liquidityVault.connect(owner).executeRebalance(0);
      
      await expect(
        liquidityVault.connect(owner).executeRebalance(0)
      ).to.be.revertedWith("LiquidityVault: Proposal already executed");
    });
  });

  describe("Agent Authority Management", function () {
    it("Should allow owner to update agent authority", async function () {
      await expect(liquidityVault.connect(owner).updateAgentAuthority(addr1.address))
        .to.emit(liquidityVault, "AgentAuthorityUpdated")
        .withArgs(agentAuthority.address, addr1.address);

      expect(await liquidityVault.agentAuthority()).to.equal(addr1.address);
    });

    it("Should reject update from non-owner", async function () {
      await expect(
        liquidityVault.connect(addr1).updateAgentAuthority(addr2.address)
      ).to.be.revertedWithCustomError(liquidityVault, "OwnableUnauthorizedAccount");
    });

    it("Should reject zero address as agent authority", async function () {
      await expect(
        liquidityVault.connect(owner).updateAgentAuthority(ethers.ZeroAddress)
      ).to.be.revertedWith("LiquidityVault: Invalid authority address");
    });
  });

  describe("Pool Allocations", function () {
    it("Should track pool allocations after execution", async function () {
      const pools = [addr1.address, addr2.address];
      const ratios = [6000, 4000];
      const reason = "Allocation test";

      await liquidityVault.connect(agentAuthority).proposeRebalance(pools, ratios, reason);
      await liquidityVault.connect(owner).executeRebalance(0);

      expect(await liquidityVault.getPoolAllocation(addr1.address)).to.equal(6000);
      expect(await liquidityVault.getPoolAllocation(addr2.address)).to.equal(4000);
    });

    it("Should return zero for unallocated pools", async function () {
      expect(await liquidityVault.getPoolAllocation(addr1.address)).to.equal(0);
    });
  });

  describe("Proposal Management", function () {
    it("Should return correct proposal details", async function () {
      const pools = [addr1.address, addr2.address];
      const ratios = [6000, 4000];
      const reason = "Detailed proposal test";

      await liquidityVault.connect(agentAuthority).proposeRebalance(pools, ratios, reason);
      
      const proposal = await liquidityVault.getRebalanceProposal(0);
      expect(proposal.pools).to.deep.equal(pools);
      expect(proposal.ratios).to.deep.equal(ratios);
      expect(proposal.reason).to.equal(reason);
      expect(proposal.executed).to.be.false;
    });

    it("Should increment proposal count correctly", async function () {
      const pools = [addr1.address, addr2.address];
      const ratios = [6000, 4000];
      const reason = "Count test";

      expect(await liquidityVault.getProposalCount()).to.equal(0);

      await liquidityVault.connect(agentAuthority).proposeRebalance(pools, ratios, reason);
      expect(await liquidityVault.getProposalCount()).to.equal(1);

      await liquidityVault.connect(agentAuthority).proposeRebalance(pools, ratios, reason);
      expect(await liquidityVault.getProposalCount()).to.equal(2);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle single pool allocation", async function () {
      const pools = [addr1.address];
      const ratios = [10000]; // 100%
      const reason = "Single pool test";

      await liquidityVault.connect(agentAuthority).proposeRebalance(pools, ratios, reason);
      await liquidityVault.connect(owner).executeRebalance(0);

      expect(await liquidityVault.getPoolAllocation(addr1.address)).to.equal(10000);
    });

    it("Should handle multiple pools with equal allocation", async function () {
      const pools = [addr1.address, addr2.address];
      const ratios = [5000, 5000]; // 50% each
      const reason = "Equal allocation test";

      await liquidityVault.connect(agentAuthority).proposeRebalance(pools, ratios, reason);
      await liquidityVault.connect(owner).executeRebalance(0);

      expect(await liquidityVault.getPoolAllocation(addr1.address)).to.equal(5000);
      expect(await liquidityVault.getPoolAllocation(addr2.address)).to.equal(5000);
    });

    it("Should handle empty pools array", async function () {
      const pools = [];
      const ratios = [];
      const reason = "Empty arrays test";

      await expect(
        liquidityVault.connect(agentAuthority).proposeRebalance(pools, ratios, reason)
      ).to.be.revertedWith("LiquidityVault: Invalid total allocation");
    });
  });
});
