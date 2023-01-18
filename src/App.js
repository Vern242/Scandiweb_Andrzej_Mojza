import React from "react";
import Category from "./Category/Category";
import Product from "./Product/Product";
import Navbar from "./Header/Navbar";
import Cart from "./Cart/Cart";
import Home from "./Home";
import { client, Query } from "@tilework/opus";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { AppContext } from "./Context";
import CurrencyFetcher from "./utils/CurrencyFetcher";

client.setEndpoint("http://localhost:4000/graphql");

class App extends React.Component {
  static contextType = AppContext;
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      categories: [],
      error: undefined,
    };
  }

  componentDidMount() {
    this.fetchCategories();
  }

  async fetchCategories() {
    const query = new Query("categories", true);
    query.addField("name");

    const categories = await client
      .post(query)
      .then((res) => res.categories)
      .then((cat) => {
        return cat;
      })
      .catch((err) => {
        this.setState({ error: err.message });
      });

    if (!categories) return;

    this.setState({ categories: categories, loading: false, error: undefined });
  }

  render() {
    const { loading, error, categories } = this.state;
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
          <Navbar categories={categories} />
        </div>
        <div className="message__container">
          <div className="message__bar">Added to cart!</div>
        </div>
        <Switch>
          <Route path="/categories/:name">
            <Category />
            <CurrencyFetcher />
          </Route>
          <Route path="/products/:id/:settings?">
            <Product />
            <CurrencyFetcher />
          </Route>
          <Route path="/cart">
            <Cart />
            <CurrencyFetcher />
          </Route>
          <Route path="*" component={() => <Home category={categories[0]} />} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
