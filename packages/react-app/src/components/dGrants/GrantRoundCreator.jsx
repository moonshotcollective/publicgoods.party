import { React, useState } from "react";
import { AddressInput, Events } from "..";
import { DatePicker, Typography, Form, Row, Col, Button, Input, Space } from "antd";
import { PINATA_API_KEY, PINATA_API_SECRET } from "../../constants";

const axios = require("axios");
const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export default function ({
  tx,
  writeContracts,
  mainnetProvider,
  readContracts,
  localProvider
}) {
  const [grantTitle, setGrantTitle] = useState();
  const [grantDescription, setGrantDescription] = useState();
  const [grantWebsite, setGrantWebsite] = useState();
  const [ownerAddress, setOwnerAddress] = useState();
  const [payeeAddress, setPayeeAddress] = useState();
  const [matchingTokenAddress, setMatchingTokenAddress] = useState();
  const [roundTimes, setRoundTimes] = useState([]);

  const grantObject = {
    title: grantTitle,
    description: grantDescription,
    website: grantWebsite
  };
  const testTuple = {
    protocol: 1,
    pointer: "grantHash"
  };

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
        tx(writeContracts.GrantRoundManager.createGrantRound(ownerAddress, payeeAddress, matchingTokenAddress, roundTimes[0], roundTimes[1], testTuple));
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  async function submitGrant() {
    await pinJSONToIPFS(PINATA_API_KEY, PINATA_API_SECRET, grantObject);
  }

  async function onChange(value) {
    const parsedTimes = [Math.floor(new Date(value[0]._d).getTime() / 1000), Math.floor(new Date(value[1]._d).getTime() / 1000)];
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
            <Space direction="vertical">
              <Form.Item>
                <Input
                  placeholder="Title"
                  onChange={e => {
                    setGrantTitle(e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item>
                <Input
                  placeholder="Website"
                  onChange={e => {
                    setGrantWebsite(e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item>
                <Input.TextArea
                  placeholder="Description"
                  onChange={e => {
                    setGrantDescription(e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item>
                <AddressInput
                  autoFocus
                  ensProvider={mainnetProvider}
                  placeholder="Grant Owner Address"
                  value={ownerAddress}
                  onChange={setOwnerAddress}
                />
              </Form.Item>
              <Form.Item>
                <AddressInput
                  autoFocus
                  ensProvider={mainnetProvider}
                  placeholder="Grant Payee Address"
                  value={payeeAddress}
                  onChange={setPayeeAddress}
                />
              </Form.Item>
              <Form.Item>
                <AddressInput
                  autoFocus
                  ensProvider={mainnetProvider}
                  placeholder="Donation Matching Token"
                  value={matchingTokenAddress}
                  onChange={setMatchingTokenAddress}
                />
              </Form.Item>
              <Form.Item>
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
            </Space>
          </Form>
        </Col>
      </Row>
      <Events
        title={"Other Grant Rounds Made:"}
        contracts={readContracts}
        contractName="GrantRoundManager"
        eventName="GrantRoundCreated"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
    </div>
  );
}
