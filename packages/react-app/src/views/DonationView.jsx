import React from "react";
import { useState, useEffect } from "react";
import { Typography, Button, Input, Form, Row, Col, List, Card, Descriptions, Space } from "antd";
import { ethers } from "ethers";
import { useContractReader } from "eth-hooks";

const axios = require('axios');
const { Title } = Typography;

export default function DonationView({ address, mainnetProvider, signer, tx, writeContracts, readContracts }) {
  const [grantID, setGrantID] = useState("...");
  const [inputToken, setInputToken] = useState("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984");
  const [donationAmount, setDonationAmount] = useState("1");
  const [isLoading, setIsLoading] = useState(true);

  // api endpoint
  const aws = "https://6mroz1xlm4.execute-api.us-west-2.amazonaws.com/prod/";

  const grantRoundManagerAddress = readContracts.GrantRoundManager ? readContracts.GrantRoundManager.address : "loading";
  const outputToken = useContractReader(readContracts, "GrantRoundManager", "donationToken");

  async function axiosTest() {
    setIsLoading(true);
    // quoute object used for fetching optimal route for swap
    const quote = {
      tokenInAddress: inputToken,
      tokenInChainId: 4,
      tokenOutAddress: outputToken,
      tokenOutChainId: 4,
      amount: ethers.utils.formatUnits(ethers.utils.parseEther(donationAmount), 0),
      type: 'exactIn',
      slippageTolerance: '5',
      recipient: grantRoundManagerAddress,
      deadline: '360',
      algorithm: 'alpha'
    };

    // Fetches the swap data from our instance of the autorouter api if the tokenIn is not the tokenOut. Otherwise init as 0
    let response = 0;
    if (quote.tokenInAddress != quote.tokenOutAddress) {
      response = await axios
        .get(aws + 'quote', {
          headers: {
            Authorization: process.env.AWS_API_KEY
          },
          params: quote
        });
    }

    // Sample Donations Object
    const donations = {
      grantId: 1,
      token: quote.tokenInAddress,
      ratio: ethers.utils.parseEther('1'),
      rounds: ['0xd0d6cDaf1D176f6b2596a04bF83772fa002807a7']
    };

    // Sample Swap Object. Data field is equal to zero if no swap is needed
    const swap = {
      inputToken: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      inputAmount: await ethers.utils.parseEther(donationAmount),
      data: response != 0 ? response.data.methodParameters.calldata : response,
      value: response != 0 ? response.data.methodParameters.value : response
    };

    // These two lines create a contract instance to approve tokens for swap
    const erc20abi = ['function approve(address spender, uint rawAmount) external returns (bool)', 'function allowance(address _owner, address _spender) public view returns (uint256 remaining)'];
    const approveToken = await new ethers.Contract(quote.tokenInAddress, erc20abi, signer);

    const allowance = await approveToken.allowance(address, grantRoundManagerAddress);
    if (await allowance < swap.inputAmount) await tx(approveToken.approve(grantRoundManagerAddress, await ethers.utils.parseEther(donationAmount)));

    // Submit the tx
    await tx(writeContracts.GrantRoundManager.donate([swap], [donations]));
    setIsLoading(false);
  }

  // Keep the button greyed out until all dependencies are loaded
  useEffect(() => {
    grantRoundManagerAddress != undefined ? setIsLoading(false) : setIsLoading(true);
  }
    , outputToken);

  return (
    <div>
      <Title >Donation View</Title>
      <Row justify="center">
        <Col lg={8} sm={16}>
          <Form name="Donate to a grant" onFinish={axiosTest}>
            <Space direction="vertical">
              <Form.Item>
                <Input
                  placeholder="Grant ID"
                  onChange={e => {
                    setGrantID(e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item>
                <Input
                  placeholder="Donation Token"
                  onChange={e => {
                    setInputToken(e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item>
                <Input
                  placeholder="Donation Amount"
                  onChange={e => {
                    setDonationAmount(e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item name="Submit">
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  Donate!
                </Button>
              </Form.Item>
            </Space>
          </Form>
        </Col>
      </Row>
    </div>
  );
}
