import React from "react";
import Category from "./Category/Category";
import Product from "./Product/Product";
import Navbar from "./Header/Navbar";
import "./App.css";
import { client, Query, Field } from "@tilework/opus";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

client.setEndpoint("http://localhost:4000/graphql");

class App extends React.Component {
  componentDidMount() {
    console.log("mounted");
    this.fetchCurrencies();
    this.fetchCategories();
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      categories: [],
      products: [],
      currencies: [],
      error: "",
    };
  }

  async fetchCurrencies() {
    const query = new Query("currencies", true);
    query.addField("label");
    query.addField("symbol");

    client
      .post(query)
      .then((res) => res.currencies)
      .then((cur) => {
        this.setState({ currencies: cur });
        console.log(cur);
      })
      .catch((err) => {
        this.setState({ error: err.message });
      });
  }

  async fetchCategories() {
    const query = new Query("categories", true);
    query.addField("name");
    query.addField(new Field("products").addField("id").addField("name"));
    const categories = await client
      .post(query)
      .then((res) => res.categories)
      .catch((err) => {
        this.setState({ error: err.message });
      });
    if (typeof categories !== "undefined") {
      const productIdsSet = new Set();
      for (const cat of categories) {
        for (const prod of cat.products) {
          productIdsSet.add(prod.id);
        }
      }
      const productIds = [...productIdsSet];
      this.setState({ categories: categories, products: productIds, loading: false });
    }
    return 0;
  }

  render() {
    //add error route if fetch fails
    if (this.state.loading) return <>{this.state.error}</>;
    return (
      <BrowserRouter>
        <Navbar categories={this.state.categories} currencies={this.state.currencies} />
        <Routes>
          {this.state.categories.map((category) => {
            return <Route key={`route_${category.name}`} element={<Category categoryName={category.name} />} path={`/${category.name}`} />;
          })}
          {this.state.products.map((productId) => {
            return <Route key={`route_${productId}`} element={<Product productId={productId} />} path={`/${productId}`} />;
          })}
          {
            // add default route if one not found
          }
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
