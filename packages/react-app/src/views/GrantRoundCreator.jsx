import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { Address, Balance, Events, GrantRoundCreator } from "../components";

export default function GrantUI({ tx, writeContracts, mainnetProvider }) {
  return (
    <div>
      <GrantRoundCreator text2display={"Hello World!"} tx={tx} writeContracts={writeContracts} />
    </div>
  );
}
