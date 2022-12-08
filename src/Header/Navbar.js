import React from "react";
import logoImg from "../Images/Brand_icon.png";
import { NavLink } from "react-router-dom";
import Minicart from "./Minicart";
import Helper from "../Helper";
import { AppContext } from "../Context";

class Navbar extends React.Component {
  static contextType = AppContext;
  constructor(props) {
    super(props);
    this.state = {
      buttonStyle: undefined,
      dropdownStyle: undefined,
      loading: true,
    };
  }

  componentDidMount() {
    const dropdownStyle = this.getStyle(".nav__dropdown");
    const buttonStyle = this.getStyle(".nav__button");

    this.setState({ buttonStyle, dropdownStyle, loading: false });

    document.body.addEventListener("mousedown", this.exitDropdown);
  }

  getStyle(classname) {
    const desiredHref = "http://localhost:3000/styles/Header.css";
    return Helper.getStyle(classname, desiredHref);
  }

  exitDropdown = (event) => {
    const button = document.getElementById("nav__button");

    if (!button.contains(event.target)) {
      this.closeDropdown();
    }
  };

  toggleDropdown = () => {
    const dropdownStyle = this.state.dropdownStyle;

    dropdownStyle.display === "none" ? this.openDropdown() : this.closeDropdown();
  };

  closeDropdown = () => {
    const dropdownStyle = this.state.dropdownStyle;
    const arrow = document.querySelector(".dropdown__arrow");
    arrow.style.transform = "rotate(45deg)";

    arrow.style["margin-bottom"] = "4px";
    dropdownStyle.display = "none";
  };

  openDropdown = () => {
    const dropdownStyle = this.state.dropdownStyle;
    const arrow = document.querySelector(".dropdown__arrow");
    arrow.style.transform = "rotate(-135deg)";

    arrow.style["margin-bottom"] = "-2px";
    dropdownStyle.display = "inline-block";
  };

  selectCurrency = (symbol) => {
    const currency = symbol;
    this.closeDropdown();

    const [context, setContext] = this.context;
    if (context.currency === symbol) return;
    setContext({ currency });
  };

  render() {
    const { loading } = this.state;
    const { currency, currentCategory } = this.context[0];
    if (loading) return <></>;
    return (
      <nav className="nav">
        <ul className="nav__list">
          <ul className="nav__section left">
            {this.props.categories.map((category, index) => {
              const border = category.name === currentCategory ? "nav__link--border" : "";
              return (
                <li key={`category${index}`}>
                  <NavLink className={`nav__link ${border}`} to={`/categories/${category.name}`} id={category.name}>
                    {category.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
          <li className="logo">
            <img className="nav__logo" src={logoImg} alt="Brand logo" />
          </li>
          <ul className="nav__section right">
            <ul className="nav__actions">
              <li className="nav__currency">
                <span className="nav__currency--display">{currency}</span>
                <button className="nav__button" onMouseDown={this.toggleDropdown} id="nav__button">
                  <span className="dropdown__arrow"></span>
                </button>
                <div className="nav__dropdown" id="nav__dropdown">
                  {this.props.currencies.map((currency) => {
                    return (
                      <div key={currency.symbol} className="nav__dropdown--item" onMouseDown={() => this.selectCurrency(currency.symbol)}>
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
