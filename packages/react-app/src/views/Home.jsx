import React from "react";
import { List, Card, Descriptions } from "antd";
import { Link } from "react-router-dom";
import { useContractReader } from "eth-hooks";
import { Address } from "../components";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 */
function Home({ mainnetProvider, readContracts, blockExplorer }) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const allGrants = useContractReader(readContracts, "GrantRegistry", "getAllGrants");

  return (
    <div style={{ marginTop: 60 }}>
      <List
        className="w-full"
        grid={{ gutter: 16, column: 3 }}
        dataSource={allGrants}
        renderItem={item => {
          return (
            <List.Item>
              <Card
                size="small"
                className="hoverableLight"
                title={
                  <div
                    style={{
                      padding: "0 0.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      justifyContent: "space-between",
                      fontWeight: 400,
                    }}
                  >
                    <div style={{ fontSize: "1rem", fontWeight: 500 }}>
                      <Link to={`/grant/sample-name`}>Name (WIP)</Link>
                    </div>
                    {/* <Address
                      fontSize="15"
                      value={item.owner}
                      blockExplorer={blockExplorer}
                      ensProvider={mainnetProvider}
                    /> */}
                  </div>
                }
              >
                <Descriptions bordered size="small" labelStyle={{ textAlign: "center", height: "2.5rem" }}>
                  <Descriptions.Item label="Creator" span={4}>
                    <Address
                      className="inline-flex justify-center items-center"
                      address={item.owner}
                      fontSize={15}
                      blockExplorer={blockExplorer}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Payee" span={4}>
                    <Address
                      className="inline-flex justify-center items-center"
                      address={item.payee}
                      fontSize={15}
                      blockExplorer={blockExplorer}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Created At" span={4}>
                    <div>{new Date(item.createdAt * 1000).toLocaleString()}</div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </List.Item>
          );
        }}
      />
    </div>
  );
}

export default Home;
