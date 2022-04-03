const { ethers } = require("hardhat");
const hre = require('hardhat');
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

const axios = require("axios");
const { AlphaRouter, SwapRouterProvider } = require('@uniswap/smart-order-router');
const { CurrencyAmount, Token, TradeType } = require("@uniswap/sdk-core");
const { JSBI, Percent } = require("@uniswap/sdk");
const { BigNumber } = require("ethers");
const { parseUnits, AbiCoder, FormatTypes } = require("ethers/lib/utils");
const { EtherscanProvider } = require("@ethersproject/providers");

use(solidity);

describe("General Grant Tests", function () {
  let grantRegistry;
  let grantRoundManager;
  let grantRound;
  let testTuple = {
    protocol: 1,
    pointer: "grantHash"
  }

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("Deployments", function () {
    it("Should deploy contracts", async function () {
      const GrantRegistry = await ethers.getContractFactory("GrantRegistry");
      grantRegistry = await GrantRegistry.deploy();
      const GrantRoundManager = await ethers.getContractFactory("GrantRoundManager");
      grantRoundManager = await GrantRoundManager.deploy(
        // Grant Registry Address
        grantRegistry.address,
        //Donation Token (WETH)
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        //v3 Factory Address
        "0x1f98431c8ad98523631ae4a59f267346ea31f984",
        //Weth Address
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      );
    });
  });

  describe("General Functionality", function () {
    it("Should allow a user to make a new grant", async function () {
      const [addr1] = await ethers.getSigners();
      const PINATA_API_KEY = "23d36077aad0c756380d";
      const PINATA_API_SECRET = "cdc26f965570d9b186ff6e1f8bd9e440af1623489a145fed7bae175d879e4a8c";
      const grantObject = {
        title: "cool grant",
        description: "cool description",
        website: "gitcoin.co"
      }
      const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
      await axios
        .post(url, grantObject, {
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_API_SECRET
          }
        })
        .then(function (response) {
          testTuple.pointer = response.data.IpfsHash;
        })
        .catch(function (error) {
          console.log(error);
        });
      await grantRegistry.connect(addr1).createGrant(addr1.address, addr1.address, testTuple);
      const grantData = await grantRegistry.grants(0);
      expect(await grantData.owner).to.equal(addr1.address);
    });

    it("Should allow a user to make a grant round", async function () {
      // impersonating myself
      const [addr1] = await ethers.getSigners();
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0x807a1752402D21400D555e1CD7f175566088b955"],
      });
      const blindnabler = await ethers.getSigner('0x807a1752402D21400D555e1CD7f175566088b955');

      await network.provider.send("evm_setNextBlockTimestamp", [1647810637]);
      await network.provider.send("evm_mine");
      await grantRoundManager.connect(blindnabler).createGrantRound(blindnabler.address, addr1.address, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 1647810647, 1647810837, testTuple);
      const roundAddress = await grantRoundManager.queryFilter('GrantRoundCreated');
      grantRound = await ethers.getContractAt('GrantRound', await roundAddress[0].args[0]);
      await network.provider.send("evm_setNextBlockTimestamp", [1647810737]);
      await network.provider.send("evm_mine");
      expect(await grantRound["isActive()"]()).to.equal(true);
    });

    it("Should allow a user to make a donation to a grant", async function () {
      // impersonating myself
      const [addr1] = await ethers.getSigners();
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0x807a1752402D21400D555e1CD7f175566088b955"],
      });
      const blindnabler = await ethers.getSigner('0x807a1752402D21400D555e1CD7f175566088b955');
      const mainnetProvider = new ethers.providers.StaticJsonRpcProvider('https://eth-mainnet.alchemyapi.io/v2/zmWcqT_0Bp4WdnWqPiZaTafia_TEyn5q');
      const router = new AlphaRouter({ chainId: 1, provider: mainnetProvider });
      const erc20abi = [
        //normal functions
        'function approve(address spender, uint rawAmount) external returns (bool)',
        'function transferFrom(address src, address dst, uint rawAmount) external returns (bool)',
        //view functions
        'function balanceOf(address account) view returns (uint)'
      ];
      const gtc = await ethers.getContractAt(erc20abi, '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F', blindnabler);
      const weth = await ethers.getContractAt(erc20abi, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', blindnabler);
      await gtc.approve(grantRoundManager.address, ethers.utils.parseEther('50000'));
      const GTC = new Token(1, "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F", 18, "GTC", "Gitcoin");
      const WETH = new Token(1, "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", 18, "WETH", "Wrapped Ether");
      const _inputAmount = CurrencyAmount.fromRawAmount(GTC, JSBI.BigInt(50 * 10 ** 18));
      const swapConfig = { recipient: grantRoundManager.address, slippageTolerance: new Percent(5, 100) };
      // spits out a route from a donation in USDC to WETH. Grant round from above has USDC as it's matching token, but WETH as the grantRoundManager Donation Token.
      console.log(await weth.balanceOf(addr1.address));
      const route = await router.route(_inputAmount, WETH, TradeType.EXACT_INPUT, swapConfig);
      const _donations = {
        grantId: 0,
        token: gtc.address,
        ratio: await ethers.utils.parseEther('1'),
        rounds: [grantRound.address]
      };
      const swap = {
        inputToken: "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F",
        inputAmount: ethers.utils.parseEther('50'),
        data: route.methodParameters.calldata,
        value: ethers.BigNumber.from(route.methodParameters.value)
      };
      await grantRoundManager.connect(blindnabler).donate([swap], [_donations]);
      expect(await weth.balanceOf(addr1.address)).to.be.gt(0);
      console.log(await weth.balanceOf(addr1.address));
    });

  });

});
