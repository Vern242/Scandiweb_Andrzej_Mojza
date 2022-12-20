import React from "react";
import Helper from "./Helper";

export const AppContext = React.createContext();

class Context extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currency: "",
      cart: [],
      currentCategory: "",
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currency !== this.state.currency) {
      Helper.saveCurrencyToStorage(this.state.currency);
    }
    if (prevState.cart !== this.state.cart) {
      Helper.saveCartToStorage(this.state.cart);
    }
  }

  setContext = (state) => {
    this.setState(state);
  };

  render() {
    return <AppContext.Provider value={[this.state, this.setContext]}>{this.props.children}</AppContext.Provider>;
  }
}

export default Context;
