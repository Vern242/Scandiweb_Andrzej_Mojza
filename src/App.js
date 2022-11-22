import React from "react";
import Category from "./Category/Category";
import Product from "./Product/Product";
import Navbar from "./Header/Navbar";
import { client, Query, Field } from "@tilework/opus";
import { BrowserRouter, Route, Switch } from "react-router-dom";

client.setEndpoint("http://localhost:4000/graphql");

class App extends React.Component {
  componentDidMount() {
    Promise.all([this.fetchCurrencies(), this.fetchCategories()])
      .then(() => this.setState({ loading: false }))
      .catch((err) => {
        this.setState({ error: err.message });
      });
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
      });
  }

  async fetchCategories() {
    const query = new Query("categories", true);
    query.addField("name");
    /*     query.addField(
      new Field("products")
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
        )
        .addField(new Field("prices").addField("amount").addField(new Field("currency").addField("label").addField("symbol")))
    ); */

    const categories = await client.post(query).then((res) => res.categories);
    if (typeof categories !== "undefined") {
      /* const productsSet = new Set();
      for (const cat of categories) {
        for (const prod of cat.products) {
          productsSet.add(prod);
        }
      } 
      const products = [...productsSet];*/
      this.setState({ categories: categories });
    }
  }

  render() {
    //add error route if fetch fails

    //passing data to routes through params instead of props

    if (this.state.loading) return <>{this.state.error}</>;
    return (
      <BrowserRouter>
        <Navbar categories={this.state.categories} currencies={this.state.currencies} />
        <Switch>
          <Route component={Category} path={`/categories/:name`} />;
          <Route component={Product} path={`/products/:id`} />;
          {
            // add default route if one not found
          }
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
