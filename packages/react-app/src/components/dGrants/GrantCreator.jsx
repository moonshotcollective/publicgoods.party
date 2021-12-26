import { React, useState } from "react";
import { AddressInput } from "..";
import { Form, Row, Col, Button } from "antd";

export default function ({
  //inputs
  text2display,
  tx,
  writeContracts,
  mainnetProvider
}) {
  const [grantTitle, setGrantTitle] = useState("...");
  const [ownerAddress, setOwnerAddress] = useState("...");
  const [payeeAddress, setPayeeAddress] = useState("...");

  function submitGrant() {
    tx(writeContracts.GrantRegistry.createGrant(ownerAddress, payeeAddress, ("1", "metadatahash")));
  }

  return (
    <div>
      <h1>MVP Grant Creator</h1>
      <br />
      <Row justify="center">
        <Col span={8}>
          <Form
            name="Create a Grant"
            onFinish={submitGrant}
          >
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