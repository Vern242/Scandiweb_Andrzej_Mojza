import React from "react";
import { client, Field, Query } from "@tilework/opus";

client.setEndpoint("http://localhost:4000/graphql");

class Product extends React.Component {
  componentDidMount() {
    console.log("component mounted: " + this.props.productId);
    this.fetchProductData();
  }
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) this.fetchProductData();
  }
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      inStock: false,
      description: "",
      category: "",
      brand: "",
      error: "",
    };
  }

  async fetchProductData() {
    const { productId } = this.props;
    console.log(productId);

    const query = new Query("product", true);
    query.addArgument("id", "String!", productId);

    query.addField("name");
    query.addField("inStock");
    query.addField("description");
    query.addField("category");
    query.addField("brand");
    //query.addField(new Field("products").addField("id").addField("name"));

    const prod = await client
      .post(query)
      .then((res) => res.product)
      .catch((err) => {
        this.setState({ error: err.message });
      });
    this.setState({
      name: prod.name,
      inStock: prod.inStock,
      description: prod.description,
      category: prod.category,
      brand: prod.brand,
    });

    return;
  }

  //output cat name and category items styled
  render() {
    if (this.state.error) return <>{this.state.error}</>;
    return (
      <div>
        <h1>{this.state.name}</h1>
        <div>{this.state.inStock ? "in stock" : "out of stock"}</div>
        <div dangerouslySetInnerHTML={{ __html: this.state.description }}></div>
        <div>{this.state.category}</div>
        <div>{this.state.brand}</div>
      </div>
    );
  }
}

export default Product;
