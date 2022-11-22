import React from "react";
import { client, Field, Query } from "@tilework/opus";

//dodac abortSignaller na unmount ??? chyba bez signala narazie
//wyczyscic kod
//podswietlic kategorie odpowiednia dla produktu.. wziac regule z headera i zmienic?

client.setEndpoint("http://localhost:4000/graphql");

class Product extends React.Component {
  componentDidMount() {
    console.log("component mounted: " + this.props.match.params.id);
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
      gallery: [],
      description: "",
      category: "",
      brand: "",
      attributes: [],
      error: "",
      loading: true,
    };
  }

  async fetchProductData() {
    const id = this.props.match.params.id;

    const query = new Query("product", true);
    query
      .addArgument("id", "String!", id)
      .addField("id")
      .addField("name")
      .addField("inStock")
      .addField("gallery")
      .addField("description")
      .addField("category")
      .addField("brand")
      .addField(
        new Field("attributes")
          .addField("id")
          .addField("name")
          .addField("type")
          .addField(new Field("items").addField("displayValue").addField("value").addField("id"))
      );

    client
      .post(query)
      .then((res) => res.product)
      .then((p) => {
        this.setState({
          name: p.name,
          inStock: p.inStock,
          gallery: p.gallery,
          description: p.description,
          category: p.category,
          brand: p.brand,
          attributes: p.attributes,
          error: "",
          loading: false,
        });
      })
      .catch((err) => {
        this.setState({ error: err.message });
      });
  }

  //output cat name and category items styled
  render() {
    const { loading, error, name, inStock, description, category, brand } = this.state;

    if (loading) return <></>;
    if (error) return <>{error}</>;
    return (
      <div>
        <h1>{name}</h1>
        <div>{inStock ? "in stock" : "out of stock"}</div>
        <div dangerouslySetInnerHTML={{ __html: description }}></div>
        <div>{category}</div>
        <div>{brand}</div>
      </div>
    );
  }
}

export default Product;
