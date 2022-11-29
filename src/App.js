import React from "react";
import Category from "./Category/Category";
import Product from "./Product/Product";
import Navbar from "./Header/Navbar";
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
    query.addField("label");
    query.addField("symbol");

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
    //add default route if one not found
    const { loading, error, categories, currencies } = this.state;

    if (error) return <>{error}</>;
    if (loading) return <></>;
    return (
      <BrowserRouter>
        <div className="header">
          <div className="modal__backdrop" />
          <Navbar categories={categories} currencies={currencies} />
        </div>
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
