import React from "react";
import { client, Field, Query } from "@tilework/opus";
import { Link } from "react-router-dom";

client.setEndpoint("http://localhost:4000/graphql");

class Category extends React.Component {
  controller = new AbortController();
  componentDidMount() {
    console.log("component mounted: " + this.props.categoryName);
    //this.fetchProducts();
  }
  componentDidUpdate(prevProps) {
    //if (prevProps !== this.props) this.fetchProducts();
  }
  componentWillUnmount() {
    this.controller.abort();
    console.log("aborted");
  }
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      error: "",
    };

    this.fetchProducts = this.fetchProducts.bind(this);
    this.abort = this.abort.bind(this);
  }
  abort() {
    this.controller.abort();
    console.log(this.controller.signal.aborted);
  }

  async fetchProducts() {
    const { categoryName } = this.props;
    console.log(categoryName);

    const query = new Query("category", true);
    query.addField("name");
    query.addField(new Field("products").addField("id").addField("name"));

    query.addArgument("input", "CategoryInput", { title: categoryName });

    const result = await client
      .post(query, { signal: this.controller.signal })
      .then((res) => res.category.products)
      .then((result) => {
        this.setState({ products: result });
        return;
      })
      .catch((err) => {
        this.setState({ error: err.message });
        console.log(err.message);
        return;
      });
    return result;
  }

  //output cat name and category items styled
  render() {
    return (
      <div>
        <h1>{this.props.categoryName}</h1>
        {this.state.products.map((product) => {
          return (
            <div key={product.id}>
              <Link to={`/${product.id}`}>{product.name}</Link>
            </div>
          );
        })}
        <button onClick={this.fetchProducts}>fetch</button>
        <button onClick={this.abort}>abort</button>
      </div>
    );
  }
}

export default Category;
