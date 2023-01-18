import React from "react";
import { client, Query } from "@tilework/opus";
import { AppContext } from "../Context";
import Helper from "./Helper";

class CurrencyFetcher extends React.Component {
  static contextType = AppContext;
  componentDidMount() {
    this.fetchCurrencies();
  }

  async fetchCurrencies() {
    const [context, setContext] = this.context;

    if (context.currencies.length > 0) return;

    const query = new Query("currencies", true);
    query.addField("label").addField("symbol");

    const currencies = await client
      .post(query)
      .then((res) => res.currencies)
      .then((cur) => {
        return cur;
      })
      .catch((err) => {
        console.log(err.message);
      });

    if (!currencies) return;

    Helper.loadCurrencyFromStorage(setContext, currencies);
    setContext({ currencies });
  }

  render() {
    return <></>;
  }
}

export default CurrencyFetcher;
