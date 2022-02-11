const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("General Grant Tests", function () {
  let grantRegistry;
  let grantRound;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("Deployments", function () {
    it("Should deploy contracts", async function () {
      const GrantRegistry = await ethers.getContractFactory("GrantRegistry");
      grantRegistry = await GrantRegistry.deploy();
      const GrantRound = await ethers.getContractFactory("GrantRound");
      grantRound = await GrantRound.deploy(
        // Grant Registry Address
        grantRegistry.address,
        // Donation Token (GTC Address)
        '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F',
        // Weth address
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        // factory address
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        // weth address
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
      );

    });

  });


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
