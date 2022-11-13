import React from "react";
import "./Navbar.css";
import logo from "../Images/Brand_icon.png";
import cart from "../Images/Empty_cart.png";
import { NavLink } from "react-router-dom";

//todo: place currency in context / redux

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { currency: "$", buttonStyle: undefined, dropdownStyle: undefined };
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.selectCurrency = this.selectCurrency.bind(this);
  }

  componentDidMount() {
    const dropdownStyle = this.getStyle(".nav__dropdown");
    const buttonStyle = this.getStyle(".nav__button");

    this.setState({ buttonStyle, dropdownStyle });

    document.body.addEventListener("mousedown", this.exitDropdown);
  }

  getStyle(className) {
    const styleSheets = document.styleSheets[0];
    for (const sheet of styleSheets.cssRules) {
      if (sheet.selectorText === className) return sheet.style;
    }
    return undefined;
  }

  exitDropdown = (event) => {
    const button = document.getElementById("nav__button");

    if (!button.contains(event.target)) {
      this.closeDropdown();
    }
  };

  toggleDropdown() {
    const dropdownStyle = this.state.dropdownStyle;

    dropdownStyle.display === "none" ? this.openDrodpdown() : this.closeDropdown();
  }

  closeDropdown() {
    const dropdownStyle = this.state.dropdownStyle;
    const buttonStyle = this.state.buttonStyle;

    buttonStyle.transform = "rotate(0.5turn)";
    buttonStyle["padding-top"] = "";
    dropdownStyle.display = "none";
  }

  openDrodpdown() {
    const dropdownStyle = this.state.dropdownStyle;
    const buttonStyle = this.state.buttonStyle;

    buttonStyle.transform = "";
    buttonStyle["padding-top"] = "10px";
    dropdownStyle.display = "inline-block";
  }

  selectCurrency(event) {
    const newCurrency = event.target.innerText.split(" ")[0];
    this.closeDropdown();

    this.setState({ currency: newCurrency });
  }

  render() {
    return (
      <nav className="nav">
        <ul className="nav__list">
          <ul className="nav__section left">
            {this.props.categories.map((category, index) => {
              return (
                <li key={`category${index}`}>
                  <NavLink className={({ isActive }) => ["nav__link", isActive ? "nav__link--border" : ""].join(" ")} to={`/${category.name}`}>
                    {category.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
          <li>
            <img className="nav__logo" src={logo} alt="Brand logo" />
          </li>
          <ul className="nav__section right">
            <ul className="nav__actions">
              <li className="nav__currency">
                <span className="nav__currency--display">{this.state.currency}</span>
                <button className="nav__button" onMouseDown={this.toggleDropdown} id="nav__button">
                  ^
                </button>
                <div className="nav__dropdown" id="nav__dropdown">
                  {this.props.currencies.map((currency) => {
                    return (
                      <div key={currency.symbol} className="nav__dropdown--item" onMouseDown={this.selectCurrency}>
                        {currency.symbol} {currency.label}
                      </div>
                    );
                  })}
                </div>
              </li>
              <li>
                <img className="nav__cart--icon" src={cart} alt="Cart icon" />
                <span className="nav__cart--dot">
                  <span className="nav__cart--dot--text">3</span>
                </span>
              </li>
            </ul>
          </ul>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
