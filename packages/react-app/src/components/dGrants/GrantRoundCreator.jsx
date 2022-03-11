import { React, useState } from "react";
import { AddressInput } from "..";
import { DatePicker, Typography, Form, Row, Col, Button, Input, InputNumber } from "antd";
import { PINATA_API_KEY, PINATA_API_SECRET } from "../../constants";

const axios = require("axios");
const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;

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
  const [roundTimes, setRoundTimes] = useState([]);

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

  async function onChange(value, dateString) {
    const parsedTimes = [Math.floor(new Date(value[0]._d).getTime() / 1000),Math.floor(new Date(value[1]._d).getTime() / 1000)];
    console.log('Selected Time: ', parsedTimes);
    setRoundTimes(parsedTimes);
  }

  return (
    <div>
      <Title >Grant Round Manager</Title>
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
              label="Website"
              name="Website">
              <Input
                onChange={e => {
                  setGrantWebsite(e.target.value);
                }}
              />
            </Form.Item>
            <Form.Item
              label="Description"
              name="Description">
              <Input.TextArea
                onChange={e => {
                  setGrantDescription(e.target.value);
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
              label="Start / Stop of Round"
              >
              <RangePicker
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                onChange={onChange}
              />
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
