import React from "react";
import { Typography, Row, Col, Card, Space, Button, Image } from "antd";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const { Title, Paragraph } = Typography;

function DetailedGrantView({ cart }) {
  const { metaPtr, id } = useParams();
  const baseURL = "https://bonez.mypinata.cloud/ipfs/" + metaPtr;
  const [post, setPost] = useState("...");
  React.useEffect(() => {
    axios.get(baseURL).then((response) => {
      setPost(response.data);
    });
  }, [post]);

  function addToCart(id) {
    if (cart.includes(id)) {
      alert('This grant is already in your cart');
    } else {
      cart.push(id);
      console.log(cart);
    }
  }
  return (
    <Row justify="center">
      <Col xl={12} xs={24}>
        <Card>
          <Space direction="vertical" size="small">
            <Title>{post.title}</Title>
            <Image src="https://media.nature.com/lw800/magazine-assets/d41586-019-00938-9/d41586-019-00938-9_16560868.jpg" width={300} />
            <Paragraph>{post.description}</Paragraph>
            <Paragraph><a href={"https://" + post.website}>{post.website}</a></Paragraph>
            <Button type="primary" size="large" onClick={() => addToCart(id)}>Add to cart</Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}

export default DetailedGrantView;
