import React from "react";
import { useState, useEffect } from "react";
import { Typography, Button, Input, Form, Row, Col, Space } from "antd";
import { ethers } from "ethers";
import { useContractReader } from "eth-hooks";

const axios = require('axios');

export default function Donate({ address, signer, tx, writeContracts, readContracts }) {
  // TODO: Change this token to be empty after I am done testing
  const [inputToken, setInputToken] = useState("0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984");
  const [donationAmount, setDonationAmount] = useState();
  const [matchingRound, setMatchingRound] = useState();
  const [isLoading, setIsLoading] = useState(true);

  // api endpoint
  const aws = "https://6mroz1xlm4.execute-api.us-west-2.amazonaws.com/prod/";

  const grantRoundManagerAddress = readContracts.GrantRoundManager ? readContracts.GrantRoundManager.address : "loading";
  const outputToken = useContractReader(readContracts, "GrantRoundManager", "donationToken");

  async function axiosTest() {
    //Grey out the button during this whole process to avoid confusion
    setIsLoading(true);
    // quote object used for fetching optimal route for swap
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
    // Ratio should change once I have implimented multiple donations at once
    const donations = {
      grantId: grantID,
      token: quote.tokenInAddress,
      ratio: ethers.utils.parseEther('1'),
      rounds: [matchingRound]
    };

    // Sample Swap Object. Data field is equal to zero if no swap is needed
    const swap = {
      inputToken: inputToken,
      inputAmount: ethers.utils.parseEther(donationAmount),
      data: response != 0 ? response.data.methodParameters.calldata : response,
      value: response != 0 ? response.data.methodParameters.value : response
    };

    // These two lines create a contract instance to approve tokens for swap
    const erc20abi = [
      'function approve(address spender, uint rawAmount) external returns (bool)', 'function allowance(address _owner, address _spender) public view returns (uint256 remaining)'
    ];
    const approveToken = await new ethers.Contract(quote.tokenInAddress, erc20abi, signer);

    const allowance = await approveToken.allowance(address, grantRoundManagerAddress);
    // Only increase allowance if required
    if (await allowance < swap.inputAmount) await tx(approveToken.approve(grantRoundManagerAddress, ethers.utils.parseEther(donationAmount)));

    // Submit the tx
    await tx(writeContracts.GrantRoundManager.donate([swap], [donations]));
    setIsLoading(false);
  }

  // Keep the button greyed out until all dependencies are loaded
  useEffect(() => {
    grantRoundManagerAddress != "loading" ? setIsLoading(false) : setIsLoading(true);
  }
    , outputToken);

  return (
      <Row justify="center">
        <Col>
          <Form name="Donate to a grant" onFinish={axiosTest}>
            <Space direction="vertical">
              <Form.Item>
                <Input placeholder="Grant ID"
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
              <Form.Item>
                <Input
                  placeholder="Matching Round Address"
                  onChange={e => {
                    setMatchingRound(e.target.value);
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
  );
}