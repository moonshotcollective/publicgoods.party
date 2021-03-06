import React from "react";
import { useState, useEffect } from "react";
import { Button, Input, Form, Row, Col, List, Card, Descriptions } from "antd";
import { ethers } from "ethers";
import { AlphaRouter } from "@uniswap/smart-order-router";
import { Percent, CurrencyAmount, Token, TradeType } from "@uniswap/sdk-core";
import { JSBI } from "@uniswap/sdk";

export default function DonationComp({
  mainnetProvider,
  address,
  tx,
}) {
  //const allGrants = useContractReader(readContracts, "GrantRegistry", "getAllGrants");
  const [grantID, setGrantID] = useState("...");
  const [donationToken, setDonationToken] = useState("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
  const [donationAmount, setDonationAmount] = useState("1");

  const router = new AlphaRouter({ chainId: 1, provider: mainnetProvider });


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
    tx(txParams);
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