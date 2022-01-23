const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("General Grant Tests", function () {
  let grantRegistry;
  let donationToken;
  let mockToken;
  let grantRound;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("Deployments", function () {
    it("Should deploy contracts", async function () {
      const GrantRegistry = await ethers.getContractFactory("GrantRegistry");
      grantRegistry = await GrantRegistry.deploy();
      const DonationToken = await ethers.getContractFactory("DonationToken");
      donationToken = await DonationToken.deploy(ethers.utils.parseEther("1.5"));
      const MockToken = await ethers.getContractFactory("MockToken");
      mockToken = await MockToken.deploy(ethers.utils.parseEther("1.5"));
      const GrantRound = await ethers.getContractFactory("GrantRound");
      grantRound = await GrantRound.deploy(
        // meta admin address
        "0x807a1752402D21400D555e1CD7f175566088b955",
        // payout admin address
        "0x807a1752402D21400D555e1CD7f175566088b955",
        // Grant Registry Address
        grantRegistry.address,
        // Donation Token
        donationToken.address,
        // Mock Token
        mockToken.address,
        //start time EPOCH
        16400185890,
        //end time EPOCH
        16500185900,
        //metadata pointer
        metaPtr = {
          protocol: 1,
          pointer: "QmTQMgoxDRj8gfNn5Cvznt5CoEE6cz9MQeZrQsNb36BMdm",
        }
      );

    });

  });

  describe("Deployer should have all tokens", function () {
    it("should transfer all tokens to deployer", async function (){
      const [addr1] = await ethers.getSigners();
      expect(await mockToken.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("1.5"));
      expect(await donationToken.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("1.5"));
    })
  })

  /*
  describe("setPurpose()", function () {
    it("Should be able to set a new purpose", async function () {
      const newPurpose = "Test Purpose";

      await myContract.setPurpose(newPurpose);
      expect(await myContract.purpose()).to.equal(newPurpose);
    });

  });
  */

});
