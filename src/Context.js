import React from "react";

export const AppContext = React.createContext();

class Context extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currency: "",
      cart: [],
    };
  }

  render() {
    return <AppContext.Provider value={[this.state, this.setState]}>{this.props.children}</AppContext.Provider>;
  }
}

export default Context;
