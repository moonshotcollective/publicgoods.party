import React from "react";
import { useState, useEffect } from "react";
import { Button, Input, Form, Row, Col, List, Card, Descriptions } from "antd";
import { ethers } from "ethers";
import { AlphaRouter } from "@uniswap/smart-order-router";
import { Percent, CurrencyAmount, Token, TradeType } from "@uniswap/sdk-core";
import { JSBI } from "@uniswap/sdk";
import { PropertySafetyFilled } from "@ant-design/icons";

export default function DonationView({
  address,
  mainnetProvider,
  tx,
}) {
  //const allGrants = useContractReader(readContracts, "GrantRegistry", "getAllGrants");
  const [grantID, setGrantID] = useState("...");
  const [donationToken, setDonationToken] = useState("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
  const [donationAmount, setDonationAmount] = useState("1");
  const router = new AlphaRouter({ chainId: 1, provider: mainnetProvider });
  const ROUTERABI = [
    { "inputs": [{ "internalType": "address", "name": "_factoryV2", "type": "address" }, { "internalType": "address", "name": "factoryV3", "type": "address" }, { "internalType": "address", "name": "_positionManager", "type": "address" }, { "internalType": "address", "name": "_WETH9", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "WETH9", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }], "name": "approveMax", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }], "name": "approveMaxMinusOne", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }], "name": "approveZeroThenMax", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }], "name": "approveZeroThenMaxMinusOne", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "callPositionManager", "outputs": [{ "internalType": "bytes", "name": "result", "type": "bytes" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "bytes[]", "name": "paths", "type": "bytes[]" }, { "internalType": "uint128[]", "name": "amounts", "type": "uint128[]" }, { "internalType": "uint24", "name": "maximumTickDivergence", "type": "uint24" }, { "internalType": "uint32", "name": "secondsAgo", "type": "uint32" }], "name": "checkOracleSlippage", "outputs": [], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "path", "type": "bytes" }, { "internalType": "uint24", "name": "maximumTickDivergence", "type": "uint24" }, { "internalType": "uint32", "name": "secondsAgo", "type": "uint32" }], "name": "checkOracleSlippage", "outputs": [], "stateMutability": "view", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "bytes", "name": "path", "type": "bytes" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amountIn", "type": "uint256" }, { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" }], "internalType": "struct IV3SwapRouter.ExactInputParams", "name": "params", "type": "tuple" }], "name": "exactInput", "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "tokenIn", "type": "address" }, { "internalType": "address", "name": "tokenOut", "type": "address" }, { "internalType": "uint24", "name": "fee", "type": "uint24" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amountIn", "type": "uint256" }, { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" }, { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }], "internalType": "struct IV3SwapRouter.ExactInputSingleParams", "name": "params", "type": "tuple" }], "name": "exactInputSingle", "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "bytes", "name": "path", "type": "bytes" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amountOut", "type": "uint256" }, { "internalType": "uint256", "name": "amountInMaximum", "type": "uint256" }], "internalType": "struct IV3SwapRouter.ExactOutputParams", "name": "params", "type": "tuple" }], "name": "exactOutput", "outputs": [{ "internalType": "uint256", "name": "amountIn", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "tokenIn", "type": "address" }, { "internalType": "address", "name": "tokenOut", "type": "address" }, { "internalType": "uint24", "name": "fee", "type": "uint24" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amountOut", "type": "uint256" }, { "internalType": "uint256", "name": "amountInMaximum", "type": "uint256" }, { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }], "internalType": "struct IV3SwapRouter.ExactOutputSingleParams", "name": "params", "type": "tuple" }], "name": "exactOutputSingle", "outputs": [{ "internalType": "uint256", "name": "amountIn", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "factoryV2", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "getApprovalType", "outputs": [{ "internalType": "enum IApproveAndCall.ApprovalType", "name": "", "type": "uint8" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "token0", "type": "address" }, { "internalType": "address", "name": "token1", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "uint256", "name": "amount0Min", "type": "uint256" }, { "internalType": "uint256", "name": "amount1Min", "type": "uint256" }], "internalType": "struct IApproveAndCall.IncreaseLiquidityParams", "name": "params", "type": "tuple" }], "name": "increaseLiquidity", "outputs": [{ "internalType": "bytes", "name": "result", "type": "bytes" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "token0", "type": "address" }, { "internalType": "address", "name": "token1", "type": "address" }, { "internalType": "uint24", "name": "fee", "type": "uint24" }, { "internalType": "int24", "name": "tickLower", "type": "int24" }, { "internalType": "int24", "name": "tickUpper", "type": "int24" }, { "internalType": "uint256", "name": "amount0Min", "type": "uint256" }, { "internalType": "uint256", "name": "amount1Min", "type": "uint256" }, { "internalType": "address", "name": "recipient", "type": "address" }], "internalType": "struct IApproveAndCall.MintParams", "name": "params", "type": "tuple" }], "name": "mint", "outputs": [{ "internalType": "bytes", "name": "result", "type": "bytes" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "previousBlockhash", "type": "bytes32" }, { "internalType": "bytes[]", "name": "data", "type": "bytes[]" }], "name": "multicall", "outputs": [{ "internalType": "bytes[]", "name": "", "type": "bytes[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "bytes[]", "name": "data", "type": "bytes[]" }], "name": "multicall", "outputs": [{ "internalType": "bytes[]", "name": "", "type": "bytes[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "bytes[]", "name": "data", "type": "bytes[]" }], "name": "multicall", "outputs": [{ "internalType": "bytes[]", "name": "results", "type": "bytes[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "positionManager", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "pull", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "refundETH", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "selfPermit", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "selfPermitAllowed", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "selfPermitAllowedIfNecessary", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "selfPermitIfNecessary", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountIn", "type": "uint256" }, { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }, { "internalType": "address", "name": "to", "type": "address" }], "name": "swapExactTokensForTokens", "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }, { "internalType": "uint256", "name": "amountInMax", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }, { "internalType": "address", "name": "to", "type": "address" }], "name": "swapTokensForExactTokens", "outputs": [{ "internalType": "uint256", "name": "amountIn", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amountMinimum", "type": "uint256" }, { "internalType": "address", "name": "recipient", "type": "address" }], "name": "sweepToken", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amountMinimum", "type": "uint256" }], "name": "sweepToken", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amountMinimum", "type": "uint256" }, { "internalType": "uint256", "name": "feeBips", "type": "uint256" }, { "internalType": "address", "name": "feeRecipient", "type": "address" }], "name": "sweepTokenWithFee", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amountMinimum", "type": "uint256" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "feeBips", "type": "uint256" }, { "internalType": "address", "name": "feeRecipient", "type": "address" }], "name": "sweepTokenWithFee", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "int256", "name": "amount0Delta", "type": "int256" }, { "internalType": "int256", "name": "amount1Delta", "type": "int256" }, { "internalType": "bytes", "name": "_data", "type": "bytes" }], "name": "uniswapV3SwapCallback", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountMinimum", "type": "uint256" }, { "internalType": "address", "name": "recipient", "type": "address" }], "name": "unwrapWETH9", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountMinimum", "type": "uint256" }], "name": "unwrapWETH9", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountMinimum", "type": "uint256" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "feeBips", "type": "uint256" }, { "internalType": "address", "name": "feeRecipient", "type": "address" }], "name": "unwrapWETH9WithFee", "outputs": [], "stateMutability": "payable", "type": "function" }, {"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"unwrapWETH9WithFee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"wrapETH","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}];

  const WETH = new Token(
    1,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether'
  );

  const USDC = new Token(
    1,
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    6,
    'USDC',
    'USD//C'
  );

  const GTC = new Token(
    1,
    donationToken,
    18,
    'GTC',
    'GITCOIN'
  );

  const _amount = CurrencyAmount.fromRawAmount(USDC, JSBI.BigInt(100 * 10 ** 6));

  const swapConfig = { recipient: address, slippageTolerance: new Percent(5, 100), deadline: 100 };

  async function donateToGrant() {
    const result = await router.route(
      _amount,
      WETH,
      TradeType.EXACT_INPUT,
      swapConfig
    );
    console.log(result);
    const txParams = {
      data: result.methodParameters.calldata,
      to: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      value: ethers.BigNumber.from(result.methodParameters.value),
      from: address,
      gasPrice: ethers.BigNumber.from(result.gasPriceWei),
    };
    console.log(txParams);
    await tx(txParams);
  }

  return (
    <div>
      <h1>MVP Donation View</h1>
      <br />
      <Row justify="center">
        <Col lg={8} sm={16}>
          <Form
            name="Donate to a grant"
            onFinish={donateToGrant}
          >
            <Form.Item
              label="GrantID"
              name="GrantID">
              <Input
                onChange={e => {
                  setGrantID(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item
              label="Donation Token"
              name="Donation Token">
              <Input
                onChange={e => {
                  setDonationToken(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item
              label="Donation Amount"
              name="Donation Amount">
              <Input
                onChange={e => {
                  setDonationAmount(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item
              name="Submit">
              <Button type="primary" htmlType="submit">
                Donate!
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
}