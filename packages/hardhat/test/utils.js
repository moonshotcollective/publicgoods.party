/**
 * @notice This file contains test utilities and helper methods
 */
const { ethers, network } = require("hardhat");
const hardhatConfig = require("../hardhat.config");
const { expect } = require("chai");
const { BigNumber, BigNumberish, utils } = require("ethers");
const { Log } = require("@ethersproject/providers");
const {
  abi: UNISWAP_POOL_ABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const {
  FeeAmount,
  Pool,
  Route,
  computePoolAddress,
  encodeRouteToPath,
} = require("@uniswap/v3-sdk");
const { Token } = require("@uniswap/sdk-core");

const { defaultAbiCoder, hexStripZeros, hexZeroPad, keccak256 } = utils;

// --- Constants ---
const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const UNISWAP_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

// Mapping from lowercase token symbol to properties about that token
const tokens = {
  eth: {
    address: ETH_ADDRESS,
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
    mappingSlot: null,
  },
  weth: {
    address: WETH_ADDRESS,
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    mappingSlot: "0x3",
  },
  dai: { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: "Dai", symbol: "DAI", decimals: 18, mappingSlot: '0x2' }, // prettier-ignore
  gtc: { address: '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F', name: "Gitcoin", symbol: "GTC", decimals: 18, mappingSlot: '0x5' }, // prettier-ignore
  usdc: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: "USD Coin", symbol: "USDC", decimals: 6, mappingSlot: '0x9' }, // prettier-ignore
  uni: { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', name: "Uniswap", symbol: "UNI", decimals: 18, mappingSlot: '0x4' }, // prettier-ignore
};

const tokensPolygon = {
  dai: {
    address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    decimals: 18,
    mappingSlot: "0x0",
  },
  usdc: {
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    decimals: 6,
    mappingSlot: "0x0",
  },
  usdt: {
    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    decimals: 6,
    mappingSlot: "0x0",
  },
  wbtc: {
    address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    decimals: 8,
    mappingSlot: "0x0",
  },
  weth: {
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    decimals: 18,
    mappingSlot: "0x0",
  },
};

// --- Assertions ---
// Verifies that two Grant objects are equal
function expectEqualGrants(grant1, grant2) {
  expect(grant1.id).to.equal(grant2.id);
  expect(grant1.owner).to.equal(grant2.owner);
  expect(grant1.payee).to.equal(grant2.payee);
  expect(grant1.metaPtr.protocol).to.equal(grant2.metaPtr.protocol);
  expect(grant1.metaPtr.pointer).to.equal(grant2.metaPtr.pointer);
  expect(grant1.createdAt).to.equal(grant2.createdAt);
  expect(grant1.lastUpdated).to.equal(grant2.lastUpdated);
}

// --- Time manipulation ---
// Fast forward time
async function timeTravel(seconds) {
  await network.provider.send("evm_increaseTime", [
    BigNumber.from(seconds).toNumber(),
  ]);
  await network.provider.send("evm_mine", []);
}

// Set timestamp of next block
async function setNextBlockTimestamp(timestamp) {
  timestamp = BigNumber.from(timestamp).toNumber();
  await network.provider.send("evm_setNextBlockTimestamp", [timestamp]);
  return timestamp;
}

// --- Uniswap Helpers ---
// Loops through an array of logs to find a Uniswap V3 `Swap` log, and returns the swap's amountOut
function getSwapAmountOut(logs) {
  const swapTopic = isPolygon()
    ? "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"
    : "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67"; // topic for Swap event

  const swapLogs = logs.filter((log) => log.topics[0] === swapTopic);
  const swapLog = swapLogs[swapLogs.length - 1]; // always use the last Swap log to get final output amount

  const swapEvent = isPolygon()
    ? "event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)"
    : "event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)";

  const iface = new ethers.utils.Interface([swapEvent]);
  const event = iface.parseLog(swapLog);
  const amountOut = isPolygon()
    ? event.args.amount0Out.gt(event.args.amount1Out)
      ? event.args.amount0Out
      : event.args.amount1Out
    : event.args.amount1; // this is often negative

  return amountOut.abs();
}

async function encodeRoutePolygon(tokens) {
  // This method returns a swap route for SushiSwap on polygon
  if (tokens[tokens.length - 1] !== "dai")
    throw new Error("Currently DAI must be the last token of the swap");

  const path = tokens.map((token) => {
    const symbol = token === "eth" ? "weth" : token;
    return tokensPolygon[symbol].address;
  });
  return path;
}

async function encodeRoute(tokens) {
  const route = await getRoute(tokens);
  return encodeRouteToPath(route, false);
}

async function getRoute(tokens) {
  const poolPromises = [];
  tokens.forEach((_, index) => {
    if (index === 0) return;
    const inputToken = tokens[index - 1];
    const outputToken = tokens[index];
    poolPromises.push(getPoolInstance(inputToken, outputToken));
  });
  const pools = await Promise.all(poolPromises);

  // Get input token. First we guess that our input token is token 0 for a pool, and if not then it must be token 1
  const inSymbol = tokens[0] === "eth" ? "weth" : tokens[0];
  let inToken = pools.find(
    (pool) => pool.token0.symbol?.toLowerCase() === inSymbol
  )?.token0;
  inToken = inToken
    ? inToken
    : pools.find((pool) => pool.token1.symbol?.toLowerCase() === inSymbol)
        ?.token1;

  // Get output token using same process
  const outSymbol =
    tokens[tokens.length - 1] === "eth" ? "weth" : tokens[tokens.length - 1];
  let outToken = pools.find(
    (pool) => pool.token0.symbol?.toLowerCase() === outSymbol
  )?.token0;
  outToken = outToken
    ? outToken
    : pools.find((pool) => pool.token1.symbol?.toLowerCase() === outSymbol)
        ?.token1;
  return new Route(pools, inToken, outToken);
}

async function getPoolInstance(token0, token1) {
  // Get pool contract
  token0 = token0 === "eth" ? "weth" : token0;
  token1 = token1 === "eth" ? "weth" : token1;
  const tokenA = new Token(1, tokens[token0].address, tokens[token0].decimals, tokens[token0].symbol, tokens[token0].name); // prettier-ignore
  const tokenB = new Token(1, tokens[token1].address, tokens[token1].decimals, tokens[token1].symbol, tokens[token1].name); // prettier-ignore
  const fee = FeeAmount.MEDIUM; // always use Medium fee for now
  const poolAddress = computePoolAddress({
    factoryAddress: UNISWAP_FACTORY,
    tokenA,
    tokenB,
    fee,
  });
  const poolContract = new ethers.Contract(
    poolAddress,
    UNISWAP_POOL_ABI,
    ethers.provider
  );

  // Read pool data
  const [slot, liquidity] = await Promise.all([
    await poolContract.slot0(),
    await poolContract.liquidity(),
  ]);
  const [sqrtPriceX96, tick] = slot;

  // Return pool instance
  return new Pool(
    tokenA,
    tokenB,
    FeeAmount.MEDIUM,
    sqrtPriceX96,
    liquidity,
    tick
  );
}

// --- Token helpers ---
// Gets token balance
async function balanceOf(tokenSymbol, address) {
  if (tokenSymbol === "eth") return ethers.provider.getBalance(address);
  const tokenMapping = getTokensMapping();
  const tokenAddress = tokenMapping[tokenSymbol].address;
  const abi = ["function balanceOf(address) external view returns (uint256)"];
  const contract = new ethers.Contract(tokenAddress, abi, ethers.provider);
  return contract.balanceOf(address);
}

// Sets token allowance
async function approve(tokenSymbol, holder, spender) {
  if (tokenSymbol === "eth") return;
  const tokenMapping = getTokensMapping();
  const tokenAddress = tokenMapping[tokenSymbol].address;
  const abi = ["function approve(address,uint256) external returns (bool)"];
  const contract = new ethers.Contract(tokenAddress, abi, holder);
  await contract.approve(spender, ethers.constants.MaxUint256);
}

// Arbitrarily set token balance of an account to a given amount
async function setBalance(tokenSymbol, to, amount) {
  // If ETH, set the balance directly
  if (tokenSymbol === "eth") {
    await network.provider.send("hardhat_setBalance", [
      to,
      BigNumber.from(amount).toHexString(),
    ]);
    return;
  }

  // Otherwise, compute the storage slot containing this users balance and use it to set the balance
  const tokenMapping = getTokensMapping();
  const slot = getBalanceOfSlotSolidity(
    tokenMapping[tokenSymbol].mappingSlot,
    to
  );
  await network.provider.send("hardhat_setStorageAt", [
    tokenMapping[tokenSymbol].address,
    slot,
    to32ByteHex(amount),
  ]);
}

// --- Private (not exported) helpers ---
// Determine the storage slot used to store an account's balance. Notes:
//   - This only works for Solidity tokens since Vyper has different storage layout rules
//   - Read about Solidity storage layout rules at https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html#mappings-and-dynamic-arrays
//   - `defaultAbiCoder.encode` is equivalent to Solidity's `abi.encode()`, and we strip leading zeros from the hashed
//     value to conform to the JSON-RPC spec: https://ethereum.org/en/developers/docs/apis/json-rpc/#hex-value-encoding
function getBalanceOfSlotSolidity(mappingSlot, address) {
  return hexStripZeros(
    keccak256(
      defaultAbiCoder.encode(["address", "uint256"], [address, mappingSlot])
    )
  );
}

// Converts a number to a 32 byte hex string
function to32ByteHex(x) {
  return hexZeroPad(BigNumber.from(x).toHexString(), 32);
}

// Returns true if we're testing against a forked Polygon, false otherwise
function isPolygon() {
  return hardhatConfig.networks?.hardhat?.forking?.url.includes("polygon");
}

// Returns the tokens mapping that should be used based on the network we're testing against
function getTokensMapping() {
  return isPolygon() ? tokensPolygon : tokens;
}

module.exports = {
  ETH_ADDRESS,
  WETH_ADDRESS,
  UNISWAP_FACTORY,
  tokens,
  tokensPolygon,
  encodeRoutePolygon,
  encodeRoute,
  balanceOf,
  approve,
  setBalance,
  expectEqualGrants,
  timeTravel,
  setNextBlockTimestamp,
  getSwapAmountOut,
};
