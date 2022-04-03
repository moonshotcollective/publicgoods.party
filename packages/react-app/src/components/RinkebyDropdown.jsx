import { Select } from "antd";

const { Option } = Select;

export default function({func}){
  return(
    <Select defaultValue="Choose a donation Token" onChange={func}>
      <Option value="0xc778417E063141139Fce010982780140Aa0cD5Ab">wETH</Option>
      <Option value="0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735">DAI</Option>
      <Option value="0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984">UNI</Option>
      <Option value="0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85">MKR</Option>
    </Select>
  );
}
