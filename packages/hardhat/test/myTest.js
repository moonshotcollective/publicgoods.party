const { ethers } = require("hardhat");
const hre = require('hardhat');
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

const axios = require("axios");
const { AlphaRouter, SwapRouterProvider } = require('@uniswap/smart-order-router');
const { CurrencyAmount, Token, TradeType } = require("@uniswap/sdk-core");
const { JSBI, Percent } = require("@uniswap/sdk");
const { BigNumber } = require("ethers");
const { parseUnits } = require("ethers/lib/utils");
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
        //Factory Address
        "0x1F98431c8aD98523631AE4a59f267346ea31F984",
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

      await grantRoundManager.connect(blindnabler).createGrantRound(blindnabler.address, blindnabler.address, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 1645115005, 1645125005, testTuple);
      const roundAddress = await grantRoundManager.queryFilter('GrantRoundCreated');
      grantRound = await ethers.getContractAt('GrantRound', roundAddress[0].address, addr1);
      expect(await grantRound.address).to.exist;
    });

    it("Should allow a user to make a donation to a grant", async function () {
      // impersonating myself
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
      ]
      const gtc = await ethers.getContractAt(erc20abi, '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F', blindnabler);
      await gtc.approve(grantRoundManager.address, ethers.utils.parseEther('50'));
      //await gtc.approve("0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", ethers.utils.parseEther('50'));
      const GTC = new Token(1, "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F", 18, "GTC", "Gitcoin");
      const WETH = new Token(1, "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", 18, "WETH", "Wrapped Ether");
      const USDC = new Token(1, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", 6, "USDC", "USD//C");
      const _amount = CurrencyAmount.fromRawAmount(GTC, JSBI.BigInt(50 * 10 ** 18));
      const swapConfig = { recipient: grantRoundManager.address, slippageTolerance: new Percent(5, 100) };
      // spits out a route from a donation in USDC to WETH. Grant round from above has USDC as it's matching token, but WETH as the grantRoundManager Donation Token.
      const route = await router.route(_amount, WETH, TradeType.EXACT_INPUT, swapConfig);
      const donation = {
        grantID: 0,
        token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        ratio: parseUnits('1', '18'),
        rounds: [grantRound.address]
      }
      const swapSummary = {
        amountIn: await ethers.utils.parseEther(_amount.toExact()),
        amountOutMin: await ethers.utils.parseEther(route.quote.toExact()),
        path: route.methodParameters.calldata
      }
      const overrides = {
        gasLimit: route.estimatedGasUsed,
        gasPrice: '69',
        value: ethers.utils.parseEther("0"),
      }
      await grantRoundManager.connect(blindnabler).donate([swapSummary], 18000000, [donation])
    });

  });

});
