import React from "react";
import { useState, useEffect } from "react";
import { Button, Input, Form, Row, Col, List, Card, Descriptions } from "antd";
import { ethers } from "ethers";
import { AlphaRouter, ChainId } from "@uniswap/smart-order-router";
import { CurrencyAmount, Token, TradeType } from "@uniswap/sdk-core";
import { Currency, JSBI } from "@uniswap/sdk";

function DonationView({ mainnetProvider, address/*  ,readContracts, blockExplorer */ }) {
  //const allGrants = useContractReader(readContracts, "GrantRegistry", "getAllGrants");
  const [grantID, setGrantID] = useState("...");
  const [donationToken, setDonationToken] = useState("...");
  const [donationAmount, setDonationAmount] = useState("...");

  //const web3provider = 'https://mainnet.infura.io/v3/b34e8cabbc174222951996ba0f93ea86';
  const router = new AlphaRouter({ chainId: 1, provider: mainnetProvider });

  const WETH = new Token(
    1,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether'
  );

  const USDC = new Token(
    ChainId.MAINNET,
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    6,
    'USDC',
    'USD//C'
  );

  const input_amount = 50 * 10 ** 18;

  async function donateToGrant() {
    const _amount = CurrencyAmount.fromRawAmount(WETH, JSBI.BigInt(input_amount));
    console.log(WETH, USDC, _amount);

    const route = await router.route({
      amount: _amount,
      tokenOut: USDC,
      swapType: TradeType.EXACT_IN,
    });
    return route;
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

export default DonationView;
