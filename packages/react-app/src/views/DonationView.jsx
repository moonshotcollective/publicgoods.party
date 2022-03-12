import React from "react";
import { useState, useEffect } from "react";
import { Typography, Button, Input, Form, Row, Col, List, Card, Descriptions } from "antd";
import { ethers, utils } from "ethers";
import { AlphaRouter } from "@uniswap/smart-order-router";
import { Percent, CurrencyAmount, Token, TradeType } from "@uniswap/sdk-core";
import { JSBI } from "@uniswap/sdk";
import { PropertySafetyFilled } from "@ant-design/icons";
import { ROUTERABI } from "../constants";
import { useContractReader } from "eth-hooks";

const { Title } = Typography;

export default function DonationView({ address, mainnetProvider, signer, tx, writeContracts, readContracts }) {
  //const allGrants = useContractReader(readContracts, "GrantRegistry", "getAllGrants");
  const [grantID, setGrantID] = useState("...");
  const [inputToken, setInputToken] = useState("0xc778417E063141139Fce010982780140Aa0cD5Ab");
  const [donationAmount, setDonationAmount] = useState("1");
  const router = new AlphaRouter({ chainId: 4, provider: mainnetProvider });

  const grantRegistryAddress = readContracts.GrantRegistry ? readContracts.GrantRegistry.address : "loading";
  const grantRoundManagerAddress = readContracts.GrantRoundManager ? readContracts.GrantRoundManager.address : "loading";

  const outputToken = useContractReader(readContracts, "GrantRoundManager", "donationToken");


  async function donateToGrant() {
    const swapInput = new Token(4, inputToken, 18, "GTC", "GITCOIN");
    const swapOutput = new Token(4, outputToken, 18, "WETH", "Wrapped Ether");
    const _amount = CurrencyAmount.fromRawAmount(swapInput, ethers.utils.parseEther(donationAmount));
    console.log(grantRoundManagerAddress);
    const swapConfig = { recipient: grantRoundManagerAddress, slippageTolerance: new Percent(5, 100) };
    const route = await router.route(_amount, swapOutput, TradeType.EXACT_INPUT, swapConfig);
    //console.log( route);
    /*
    const _donations = {
      grantId: grantID,
      token: inputToken,
      ratio: ethers.utils.parseEther('1'),
      rounds: ['0xd0d6cDaf1D176f6b2596a04bF83772fa002807a7']
    };
    const swap = {
      inputToken: inputToken,
      inputAmount: ethers.utils.parseEther(donationAmount),
      data: route.methodParameters.calldata,
    };
    */
    //const erc20abi = ['function approve(address spender, uint rawAmount) external returns (bool)'];
    //const approveToken = await ethers.getContractAt(erc20abi, inputToken, signer);
    //console.log(await route);
    //console.log('Output token: ', outputToken);
    //await tx(approveToken.approve(grantRoundManagerAddress, ethers.utils.parseEther(donationAmount)));
    //await tx(writeContracts.GrantRoundManager.donate([swap], [_donations]));
  }

  return (
    <div>
      <Title >MVP Donation View</Title>
      <Row justify="center">
        <Col lg={8} sm={16}>
          <Form name="Donate to a grant" onFinish={donateToGrant}>
            <Form.Item label="GrantID" name="GrantID">
              <Input
                onChange={e => {
                  setGrantID(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item label="Donation Token" name="Donation Token">
              <Input
                onChange={e => {
                  setInputToken(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item label="Donation Amount" name="Donation Amount">
              <Input
                onChange={e => {
                  setDonationAmount(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item name="Submit">
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
