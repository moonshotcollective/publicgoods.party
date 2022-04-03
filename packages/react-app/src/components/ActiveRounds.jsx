import { List, Typography, Button } from "antd";
import { useEffect, useState } from "react";
import Address from "./Address";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { ethers } from "ethers";

const { Title } = Typography;

export default function ActiveRounds({ readContracts, localProvider, mainnetProvider }) {

    const [rounds, setRounds] = useState();
    const events = useEventListener(readContracts, "GrantRoundManager", "GrantRoundCreated", localProvider, 1);
    const roundABI = ['function isActive() external view returns(bool)'];

    async function getActiveContracts(trackedRounds) {
        const contract = new ethers.Contract(trackedRounds[0].args[0], roundABI, localProvider);
        const returnArr = [];
        for await (const emittedRound of trackedRounds) {
            contract.attach(emittedRound.args[0]);
            const response = await contract.isActive();
            if (response) returnArr.push(emittedRound.args[0]);
        }
        setRounds(returnArr)
    }

    useEffect(() => {
        if(events[0]) getActiveContracts(events)
    }, [events])

    return (
        <div>
            <Title level={3}>Active Grant Rounds</Title>
            <List bordered dataSource={rounds} renderItem={item => {
                return (
                    <List.Item>
                        <Address address={item} ensProvider={mainnetProvider} fontSize={16} />
                    </List.Item>
                );
            }}
            />
        </div>
    );
}
