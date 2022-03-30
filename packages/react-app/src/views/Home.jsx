import React from "react";
import { Typography, List, Card, Descriptions } from "antd";
import { Link} from "react-router-dom";
import { useContractReader } from "eth-hooks";
import { Address } from "../components";
import { NameViewer } from "./";

const { Title } = Typography;

function Home({ readContracts, blockExplorer }) {
  const allGrants = useContractReader(readContracts, "GrantRegistry", "getAllGrants", 300000);
  return (
    <div>
      <Title >Grant Explorer</Title>
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
                      <Link to={`/grant/${item.metaPtr.pointer}/${item.id}`}><NameViewer metaPtr={item.metaPtr.pointer}/><NameViewer /></Link>
                    </div>
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
