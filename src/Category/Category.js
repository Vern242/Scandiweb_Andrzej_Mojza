import React from "react";
import CategoryProduct from "./CategoryProduct";
import { client, Query, Field } from "@tilework/opus";

class Category extends React.Component {
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
    this.fetchProducts();
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
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
    query.addField("name");
    query.addField(
      new Field("products")
        .addField("id")
        .addField("name")
        .addField("inStock")
        .addField("gallery")
        .addField("category")
        .addField("brand")
        .addField(new Field("prices").addField("amount").addField(new Field("currency").addField("label").addField("symbol")))
    );
    query.addArgument("input", "CategoryInput", { title: this.props.match.params.name });

    client
      .post(query, { signal: this.controller.signal })
      .then((res) => res.category)
      .then((category) => {
        this.setState({ category: category, products: category.products, loading: false, error: undefined });
        this.activateCategoryBorder(category.name);
      })
      .catch((err) => {
        if (err?.name === "AbortError") {
          return undefined;
        }
        this.setState({ error: err.message });
        console.log(err.message);
      });
  }

  activateCategoryBorder(categoryName) {
    const navCategory = document.getElementById(categoryName);
    navCategory.classList.add("nav__link--border");
  }

  render() {
    const { products, category, loading, error } = this.state;

    if (loading) return <></>;
    if (error) return <>{error}</>;
    return (
      <div>
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

export default Category;
