import React from "react";

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

  componentDidUpdate() {
    console.log(this.state);
  }

  setContext = (state) => {
    this.setState(state);
  };

  render() {
    return <AppContext.Provider value={[this.state, this.setContext]}>{this.props.children}</AppContext.Provider>;
  }
}

export default Context;
