import { Select } from "antd";
import { useEffect, useState } from "react";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { ethers } from "ethers";

const { Option } = Select;

export default function SelectRounds({ readContracts, localProvider, func }) {
  const [children, setChildren] = useState();
  const [disabled, setDisabled] = useState(true);
  const events = useEventListener(readContracts, "GrantRoundManager", "GrantRoundCreated", localProvider, 1);
  const roundABI = ['function isActive() external view returns(bool)'];

  async function getActiveContracts(trackedRounds) {
    try {
    const contract = new ethers.Contract(trackedRounds[0].args[0], roundABI, localProvider);
    const returnArr = [];
    for await (const emittedRound of trackedRounds) {
      contract.attach(emittedRound.args[0]);
      const response = await contract.isActive();
      if (response) returnArr.push(<Option key={emittedRound.args[0]} value={emittedRound.args[0]}>{emittedRound.args[0].substring(0,10)}...</Option>);
    }
    setDisabled(false)
    setChildren(returnArr)
    } catch {
      console.error("Error yo");
    }
  }

  useEffect(() => {
    if (events[0]) getActiveContracts(events)
  }, [events])

  return (
      <Select
      disabled={disabled}
      placeholder="Matching rounds"
      onChange={func}
      mode="multiple">
      {children}
      </Select>
  );
}