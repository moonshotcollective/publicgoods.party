import React from "react";
import { useEffect } from "react";
import { List, Card, Descriptions } from "antd";
import { useContractReader } from "eth-hooks";
import { Address } from "../components";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 */
function DetailedGrantView({/* mainnetProvider, readContracts, blockExplorer */}) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  
  //const allGrants = useContractReader(readContracts, "GrantRegistry", "getAllGrants");
  const { metaPtr } = useParams();
  const baseURL = "https://bonez.mypinata.cloud/ipfs/" + metaPtr;
  const [post, setPost] = useState("...");
  React.useEffect(() => {
    axios.get(baseURL).then((response) => {
      setPost(response.data);
    });
  }, []);
  return (
    <div>
      <h1>Grant Title: {post.title}</h1>
      <br />
      <h1>Grant Description: {post.description}</h1>
      <br />
      <h1>Grant Website: <a href={"https://"+post.website}>{post.website}</a></h1>
    </div>
  );
}

export default DetailedGrantView;
