import { PageHeader } from "antd";
import React from "react";

export default function Header() {
  return (
    <a href="https://moonshotcollective.space" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="💰Public Goods Party💰"
        subTitle="A forkable grant funding toolkit by the moonshot collective!"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
