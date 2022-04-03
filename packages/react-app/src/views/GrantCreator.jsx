import { React, useState } from "react";
import { AddressInput } from "../components";
import { Typography, Form, Row, Col, Button, Input, Space } from "antd";
import { PINATA_API_KEY, PINATA_API_SECRET } from "../constants";

const axios = require("axios");
const { Title } = Typography;

export default function GrantCreator({
  tx,
  writeContracts,
  mainnetProvider
}) {

  const [grantTitle, setGrantTitle] = useState();
  const [grantDescription, setGrantDescription] = useState();
  const [grantWebsite, setGrantWebsite] = useState();
  const [ownerAddress, setOwnerAddress] = useState();
  const [payeeAddress, setPayeeAddress] = useState();

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
        tx(writeContracts.GrantRegistry.createGrant(ownerAddress, payeeAddress, testTuple));
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <Row justify="center">
      <Col lg={8} sm={16}>
        <Title >Grant Publisher</Title>
        <Form
          name="Create a Grant"
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
                placeholder="Owner Address"
                value={ownerAddress}
                onChange={setOwnerAddress}
              />
            </Form.Item>
            <Form.Item>
              <AddressInput
                autoFocus
                ensProvider={mainnetProvider}
                placeholder="Payee Address"
                value={payeeAddress}
                onChange={setPayeeAddress}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Create Grant
              </Button>
            </Form.Item>
          </Space>
        </Form>
      </Col>
    </Row>
  );
}
