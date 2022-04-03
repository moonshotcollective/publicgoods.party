import { React, useState } from "react";
import { AddressInput, ActiveRounds, RinkebyDropdown } from "../components";
import { DatePicker, Typography, Form, Row, Col, Button, Input, Space, List } from "antd";
import { PINATA_API_KEY, PINATA_API_SECRET } from "../constants";

const axios = require("axios");
const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function GrantRoundCreator({
  tx,
  writeContracts,
  mainnetProvider,
  readContracts,
  localProvider,
  signer
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

  async function pinJSONToIPFS(pinataApiKey, pinataSecretApiKey, JSONBody) {
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

  function onChange(value) {
    const parsedTimes = [Math.floor(new Date(value[0]._d).getTime() / 1000), Math.floor(new Date(value[1]._d).getTime() / 1000)];
    console.log('Selected Time: ', parsedTimes);
    setRoundTimes(parsedTimes);
  }

  return (
    <Row justify="center">
      <Col lg={8} sm={16}>
        <Title >Grant Round Manager</Title>
        <Form
          name="Start a grant Round"
          onFinish={async () => await pinJSONToIPFS(PINATA_API_KEY, PINATA_API_SECRET, grantObject)}
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
                placeholder="Round Owner Address"
                value={ownerAddress}
                onChange={setOwnerAddress}
              />
            </Form.Item>
            <Form.Item>
              <AddressInput
                autoFocus
                ensProvider={mainnetProvider}
                placeholder="Round Payee Address"
                value={payeeAddress}
                onChange={setPayeeAddress}
              />
            </Form.Item>
            <Form.Item>
              <RinkebyDropdown
                func={(value) => setMatchingTokenAddress(value)}
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
        <ActiveRounds
        readContracts={readContracts}
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        signer={signer}
        />
      </Col>
    </Row>
  );
}
