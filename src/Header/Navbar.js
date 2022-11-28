import React from "react";
import logoImg from "../Images/Brand_icon.png";
import cartImg from "../Images/Empty_cart.png";
import { NavLink } from "react-router-dom";
import Helper from "../Helper";
import { AppContext } from "../Context";

//      add cart -- modal

class Navbar extends React.Component {
  static contextType = AppContext;
  constructor(props) {
    super(props);
    this.state = {
      currency: "",
      cart: [],
      buttonStyle: undefined,
      dropdownStyle: undefined,
      loading: true,
    };
  }

  componentDidMount() {
    const dropdownStyle = this.getStyle(".nav__dropdown");
    const buttonStyle = this.getStyle(".nav__button");

    const [context] = this.context;
    const { currency, cart } = context;

    this.setState({ buttonStyle, dropdownStyle, cart, currency, loading: false });

    document.body.addEventListener("mousedown", this.exitDropdown);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      console.log("changed navbar");
      const [context] = this.context;
      const { currency, cart } = context;
      this.setState({ currency, cart });
    }
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

    dropdownStyle.display === "none" ? this.openDrodpdown() : this.closeDropdown();
  };

  closeDropdown = () => {
    const dropdownStyle = this.state.dropdownStyle;
    const buttonStyle = this.state.buttonStyle;

    buttonStyle.transform = "rotate(0.5turn)";
    buttonStyle["padding-top"] = "";
    dropdownStyle.display = "none";
  };

  openDrodpdown = () => {
    const dropdownStyle = this.state.dropdownStyle;
    const buttonStyle = this.state.buttonStyle;

    buttonStyle.transform = "";
    buttonStyle["padding-top"] = "10px";
    dropdownStyle.display = "inline-block";
  };

  selectCurrency = (event) => {
    const currency = event.target.innerText.split(" ")[0];
    this.closeDropdown();

    const [, setContext] = this.context;
    setContext({ currency });
  };

  cartQuantity = () => {
    const { cart } = this.state;
    let quantity = 0;
    for (let i = 0; i < cart.length; i++) {
      quantity += cart[i].quantity;
    }
    return quantity;
  };

  render() {
    const { loading, currency, cart } = this.state;
    if (loading) return <></>;
    return (
      <nav className="nav">
        <ul className="nav__list">
          <ul className="nav__section left">
            {this.props.categories.map((category, index) => {
              return (
                <li key={`category${index}`}>
                  <NavLink activeClassName="nav__link--border" className="nav__link" to={`/categories/${category.name}`} id={category.name}>
                    {category.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
          <li>
            <img className="nav__logo" src={logoImg} alt="Brand logo" />
          </li>
          <ul className="nav__section right">
            <ul className="nav__actions">
              <li className="nav__currency">
                <span className="nav__currency--display">{currency}</span>
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
                <img className="nav__cart--icon" src={cartImg} alt="Cart icon" />
                {cart.length > 0 && (
                  <span className="nav__cart--dot">
                    <span className="nav__cart--dot--text">{this.cartQuantity()}</span>
                  </span>
                )}
              </li>
            </ul>
          </ul>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
