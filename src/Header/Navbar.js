import React from "react";
import logoImg from "../Images/Brand_icon.png";
import { NavLink } from "react-router-dom";
import Minicart from "./Minicart";
import { AppContext } from "../Context";

class Navbar extends React.Component {
  static contextType = AppContext;

  componentDidMount() {
    document.body.addEventListener("mousedown", this.exitDropdown);
  }

  exitDropdown = (event) => {
    const button = document.querySelector(".nav__button");

    if (!button.contains(event.target)) this.closeDropdown();
  };

  toggleDropdown = () => {
    const dropdown = document.querySelector(".nav__dropdown");
    const arrow = document.querySelector(".nav__dropdownArrow");

    dropdown.classList.toggle("open");
    arrow.classList.toggle("open");
  };

  closeDropdown = () => {
    const dropdown = document.querySelector(".nav__dropdown");
    const arrow = document.querySelector(".nav__dropdownArrow");

    if (!dropdown.classList.contains("open")) return;

    dropdown.classList.toggle("open");
    arrow.classList.toggle("open");
  };

  selectCurrency = (symbol) => {
    const currency = symbol;
    this.closeDropdown();

    const [context, setContext] = this.context;
    if (context.currency === symbol) return;
    setContext({ currency });
  };

  render() {
    const { currency, currentCategory, currencies } = this.context[0];
    return (
      <nav className="nav">
        <ul className="nav__list">
          <ul className="nav__section nav__section--left">
            {this.props.categories.map((category, index) => {
              const selected = category.name === currentCategory ? "selected" : "";
              return (
                <li key={`category${index}`}>
                  <NavLink className={`nav__link ${selected}`} to={`/categories/${category.name}`}>
                    {category.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
          <li>
            <img className="nav__logo" src={logoImg} alt="Brand logo" />
          </li>
          <ul className="nav__section nav__section--right">
            <ul className="nav__actions">
              <li className="nav__currency">
                <span className="nav__currencyText">{currency}</span>
                <button className="nav__button" onMouseDown={this.toggleDropdown}>
                  <span className="nav__dropdownArrow"></span>
                </button>
                <div className="nav__dropdown">
                  {currencies.map((currency) => {
                    return (
                      <div key={currency.symbol} className="nav__dropdownItem" onMouseDown={() => this.selectCurrency(currency.symbol)}>
                        {currency.symbol} {currency.label}
                      </div>
                    );
                  })}
                </div>
              </li>
              <Minicart />
            </ul>
          </ul>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
