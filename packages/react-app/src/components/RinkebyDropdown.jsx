import { Select } from "antd";

const { Option } = Select;

export default function({func}){
  return(
    <Select defaultValue="ETH" onChange={func}>
      <Option value="ETH">ETH</Option>
      <Option value="DAI">DAI</Option>
      <Option value="UNI">UNI</Option>
      <Option value="MKR">MKR</Option>
    </Select>
  );
}
