import { List, Typography } from "antd";
import { useEffect, useState } from "react";
import Address from "./Address";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { ethers } from "ethers";

const { Title } = Typography;

export default function ActiveRounds({readContracts, localProvider, signer, mainnetProvider}) {
  const [rounds, setRounds] = useState();
  const events = useEventListener(readContracts, "GrantRoundManager", "GrantRoundCreated", localProvider, 1);
  async function mapGrants(events) {
    const roundABI = ['function isActive() external view returns(bool)']
    const mapped = events.map(x => {
      const round = new ethers.Contract(x.args[0], roundABI, signer);
      if(round.isActive()) return x.args[0];
    })
    return mapped;
  }

  useEffect(async () => {
    setRounds(await mapGrants(events));
  }, [events])

  return (
    <div>
      <Title level={3}>Active Grant Rounds</Title>
      <List
        bordered
        dataSource={rounds}
        renderItem={item => {
          return (
            <List.Item >
              <Address address={item} ensProvider={mainnetProvider} fontSize={16} />
            </List.Item>
          );
        }}
      />
    </div>
  );
}