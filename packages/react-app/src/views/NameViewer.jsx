import React from "react";
import axios from "axios";
import { useState, useEffect} from "react";

function NameViewer(props) {
  const baseURL = "https://bonez.mypinata.cloud/ipfs/" + props.metaPtr;
  const [post, setPost] = useState(null);
  useEffect(() => {
    axios.get(baseURL).then((response) => {
      setPost(response.data);
    }, (error) => {
      setPost("...")
    });
  }), [];
  if(!post) return null;
  return (
    <div>
      {post.title}
    </div>
  )
}

export default NameViewer;