import React from "react";
import { client, Field, Query } from "@tilework/opus";

client.setEndpoint("http://localhost:4000/graphql");

class Category extends React.Component {
  componentDidMount() {
    console.log("component mounted: " + this.props.category);
    this.fetchProducts();
  }
  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) this.fetchProducts();
  }
  constructor(props) {
    super(props);
    this.state = { products: [] };
  }

  async fetchProducts() {
    const { category } = this.props;
    console.log(category);

    const query = new Query("category", true);
    query.addField("name");
    query.addField(new Field("products").addField("id").addField("name"));

    query.addArgument("input", "CategoryInput", { title: category });

    const result = await client.post(query).then((res) => res.category.products);
    this.setState({ products: result });
    console.log(result);
    return result;
  }

  //output cat name and category items styled
  render() {
    return (
      <div>
        <h1>{this.props.category}</h1>
        {this.state.products.map((prod) => {
          return <div key={prod.id}>{prod.name}</div>;
        })}
      </div>
    );
  }
}

export default Category;
