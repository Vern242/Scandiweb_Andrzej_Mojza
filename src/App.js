import React from "react";
import Category from "./Category/Category";
import Product from "./Product/Product";
import Navbar from "./Header/Navbar";
import Cart from "./Cart/Cart";
import Home from "./Home";
import { client, Query } from "@tilework/opus";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { AppContext } from "./Context";

client.setEndpoint("http://localhost:4000/graphql");

class App extends React.Component {
  static contextType = AppContext;
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      categories: [],
      currencies: [],
      error: undefined,
    };
  }

  componentDidMount() {
    Promise.all([this.fetchCurrencies(), this.fetchCategories()])
      .then(([cur, cat]) => {
        const [, setContext] = this.context;

        setContext({ currency: cur[0].symbol });
        this.setState({ currencies: cur, categories: cat, loading: false, error: undefined });
      })
      .catch((err) => {
        this.setState({ error: err.message });
      });
  }

  async fetchCurrencies() {
    const query = new Query("currencies", true);
    query.addField("label").addField("symbol");

    return client
      .post(query)
      .then((res) => res.currencies)
      .then((cur) => {
        return cur;
      });
  }

  async fetchCategories() {
    const query = new Query("categories", true);
    query.addField("name");

    return client
      .post(query)
      .then((res) => res.categories)
      .then((cat) => {
        return cat;
      });
  }

  render() {
    const { loading, error, categories, currencies } = this.state;
    if (error)
      return (
        <div className="category">
          <div className="category__name">{error}</div>
        </div>
      );
    if (loading) return <></>;
    return (
      <BrowserRouter>
        <div>
          <div className="modal__backdrop" />
          <Navbar categories={categories} currencies={currencies} />
        </div>
        <Switch>
          <Route component={Category} path="/categories/:name" />;
          <Route component={Product} path="/products/:id" />;
          <Route component={Cart} path="/cart" />;
          <Route component={() => <Home category={categories[0]} />} path="*" />;
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
