import React from "react";
import Category from "./Category/Category";
import { client, Query } from "@tilework/opus";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

client.setEndpoint("http://localhost:4000/graphql");

class App extends React.Component {
  componentDidMount() {
    console.log("mounted");
    this.fetchCategories();
  }

  constructor(props) {
    super(props);
    this.state = { categories: [] };
  }

  async fetchCategories() {
    const query = new Query("categories", true);
    query.addField("name");
    const result = await client.post(query).then((res) => res.categories);
    this.setState({ categories: result });
    console.log(result);
    return result;
  }

  render() {
    return (
      <BrowserRouter>
        <div> NAVBAR HERE</div>
        <nav>
          <ul>
            {this.state.categories.map((category, index) => {
              return (
                <li key={`category${index}`}>
                  <Link to={`/${category.name}`}>{category.name}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Routes>
          {this.state.categories.map((category) => {
            return <Route key={`route_${category}`} element={<Category category={category.name} />} path={`/${category.name}`} />;
          })}
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
