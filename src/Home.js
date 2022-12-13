import React from "react";
import { Redirect } from "react-router-dom";

class Home extends React.Component {
  render() {
    const { category } = this.props;

    if (!category) return <></>;
    return (
      <>
        <Redirect to={`/categories/${category.name}`} />
      </>
    );
  }
}

export default Home;
