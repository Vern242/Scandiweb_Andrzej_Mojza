import React from "react";
import CategoryProduct from "./CategoryProduct";
import { client, Query, Field } from "@tilework/opus";
import Helper from "../utils/Helper";
import { AppContext } from "../Context";
import { withRouter } from "react-router-dom";

class Category extends React.Component {
  static contextType = AppContext;
  controller = new AbortController();
  constructor(props) {
    super(props);
    this.state = {
      category: {},
      products: [],
      loading: true,
      error: undefined,
    };
  }

  componentDidMount() {
    console.log("Mounted: Category");
    window.scrollTo(0, 0);
    this.fetchProducts();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.name !== prevProps.match.params.name) {
      this.controller.abort();
      this.controller = new AbortController();

      this.fetchProducts();
      console.log("Updated: Category");
    }
  }

  componentWillUnmount() {
    console.log("Aborted: Category");
    this.controller.abort();
  }

  async fetchProducts() {
    const query = new Query("category", true);
    query
      .addArgument("input", "CategoryInput", { title: this.props.match.params.name })
      .addField("name")
      .addField(
        new Field("products")
          .addField("id")
          .addField("name")
          .addField("inStock")
          .addField("gallery")
          .addField("category")
          .addField("brand")
          .addField(new Field("prices").addField("amount").addField(new Field("currency").addField("label").addField("symbol")))
          .addField(
            new Field("attributes")
              .addField("id")
              .addField("name")
              .addField("type")
              .addField(new Field("items").addField("displayValue").addField("value").addField("id"))
          )
      );

    const category = await client
      .post(query, { signal: this.controller.signal })
      .then((res) => res.category)
      .then((category) => {
        return category;
      })
      .catch((err) => {
        if (err?.name === "AbortError") return undefined;

        this.setState({ error: err.message, loading: false });
        console.log(err.message);
      });
    if (!category) return;

    this.setState({ category: category, products: category.products, loading: false, error: undefined });
    this.updateCurrentCategory(category.name);
  }

  updateCurrentCategory = (category) => {
    Helper.updateCurrentCategory(category, this.context);
  };

  render() {
    const { products, category, loading, error } = this.state;

    if (loading) return <></>;
    if (error === "category is null")
      return (
        <div className="category">
          <div className="category__name">Couldn't find the category: {this.props.match.params.name}</div>
        </div>
      );
    if (error)
      return (
        <div className="category">
          <div className="category__name">{error}</div>
        </div>
      );
    return (
      <div className="category">
        <div className="category__name">{category.name}</div>
        <div className="category__products">
          {products.map((product) => {
            return <CategoryProduct key={`category_product${product.id}`} product={product} />;
          })}
        </div>
      </div>
    );
  }
}

export default withRouter(Category);
