import { React, useState } from "react";
import { AddressInput } from "..";
import { Typography, Form, Row, Col, Button, Input, InputNumber } from "antd";
import { PINATA_API_KEY, PINATA_API_SECRET } from "../../constants";

const axios = require("axios");
const { Title, Paragraph, Text } = Typography;

export default function ({
  tx,
  writeContracts,
  mainnetProvider
}) {
  const [grantTitle, setGrantTitle] = useState("...");
  const [grantDescription, setGrantDescription] = useState("...");
  const [grantWebsite, setGrantWebsite] = useState("...");
  const [grantHash, setGrantHash] = useState("...");
  const [ownerAddress, setOwnerAddress] = useState("...");
  const [payeeAddress, setPayeeAddress] = useState("...");
  const [matchingTokenAddress, setMatchingTokenAddress] = useState("0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F");
  const [startTime, setStartTime] = useState("...");
  const [endTime, setEndTime] = useState("...");

  // I am not 100% sure if this is the correct metadata structure for the grant round but oh well
  const grantObject = {
    title: grantTitle,
    description: grantDescription,
    website: grantWebsite
  }
  const testTuple = {
    protocol: 1,
    pointer: "grantHash"
  } 

  function pinJSONToIPFS(pinataApiKey, pinataSecretApiKey, JSONBody) {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    return axios
      .post(url, JSONBody, {
        headers: {
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey
        }
      })
      .then(function (response) {
        testTuple.pointer = response.data.IpfsHash;
        tx(writeContracts.GrantRoundManager.createGrantRound(ownerAddress, payeeAddress, matchingTokenAddress, startTime, endTime, testTuple));
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  async function submitGrant() {
    await pinJSONToIPFS(PINATA_API_KEY, PINATA_API_SECRET, grantObject);
  }

  return (
    <div>
      <Title >Grant Round Creator</Title>
      <br />
      <Row justify="center">
        <Col lg={8} sm={16}>
          <Form
            name="Start a grant Round"
            onFinish={submitGrant}
          >
            <Form.Item
              label="Title"
              name="Title">
              <Input
                onChange={e => {
                  setGrantTitle(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item
              label="Description"
              name="Description">
              <Input
                onChange={e => {
                  setGrantDescription(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item
              label="Website"
              name="Website">
              <Input
                onChange={e => {
                  setGrantWebsite(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item
              label="ownerAddress"
              name="ownerAddress">
              <AddressInput
                autoFocus
                ensProvider={mainnetProvider}
                placeholder="Enter address"
                value={ownerAddress}
                onChange={setOwnerAddress}
              />
            </Form.Item>
            <Form.Item
              label="payeeAddress"
              name="payeeAddress">
              <AddressInput
                autoFocus
                ensProvider={mainnetProvider}
                placeholder="Enter address"
                value={payeeAddress}
                onChange={setPayeeAddress}
              />
            </Form.Item>
            <Form.Item
              label="matchingToken"
              name="matchingToken">
              <AddressInput
                autoFocus
                ensProvider={mainnetProvider}
                placeholder="matchingToken"
                value={matchingTokenAddress}
                onChange={setMatchingTokenAddress}
              />
            </Form.Item>
            <Form.Item
              label="startTime"
              name="startTime"
              >
                <InputNumber onChange={setStartTime}/>
            </Form.Item>
            <Form.Item
              label="endTime"
              name="endTime">
                <InputNumber onChange={setEndTime}/>
            </Form.Item>
            <Form.Item
              name="createGrant">
              <Button type="primary" htmlType="submit">
                Create Grant
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
}
