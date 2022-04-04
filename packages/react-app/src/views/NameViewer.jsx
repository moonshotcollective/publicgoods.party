import React from "react";
import axios from "axios";
import { useState, useEffect} from "react";

function NameViewer(props) {
  const baseURL = "https://bonez.mypinata.cloud/ipfs/" + props.metaPtr;
  const [post, setPost] = useState("...");

  async function fetchData(){
    await axios.get(baseURL).then((response) => {
      setPost(response.data);
    }, (error) => {
    });
  }
  useEffect(() => {
    if(props.metaPtr != undefined) fetchData(baseURL);
  }), [post];
  return (
    <div>
      {post.title}
    </div>
  )
}

export default NameViewer;
