import React from "react";
import Category from "./Category/Category";
import Product from "./Product/Product";
import Navbar from "./Header/Navbar";
import { client, Query } from "@tilework/opus";
import { BrowserRouter, Route, Switch } from "react-router-dom";

client.setEndpoint("http://localhost:4000/graphql");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      categories: [],
      products: [],
      currencies: [],
      error: undefined,
    };
  }

  componentDidMount() {
    Promise.all([this.fetchCurrencies(), this.fetchCategories()])
      .then(() => this.setState({ loading: false, error: undefined }))
      .catch((err) => {
        this.setState({ error: err.message });
      });
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

    const categories = await client.post(query).then((res) => res.categories);
    if (typeof categories !== "undefined") {
      this.setState({ categories: categories });
    }
  }

  render() {
    //add error route if fetch fails
    const { loading, error, categories, currencies } = this.state;

    if (error) return <>{error}</>;
    if (loading) return <></>;
    return (
      <BrowserRouter>
        <Navbar categories={categories} currencies={currencies} />
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
