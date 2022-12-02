import React from "react";
import logoImg from "../Images/Brand_icon.png";
import cartImg from "../Images/Empty_cart.png";
import { NavLink } from "react-router-dom";
import Helper from "../Helper";
import { AppContext } from "../Context";

//      experiment around more with background image values to find a better fit for product page
//      turn cart into another component - create another css file for it

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
    document.body.addEventListener("mousedown", this.exitCart);
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

  selectCurrency = (symbol) => {
    const currency = symbol;
    this.closeDropdown();

    const [, setContext] = this.context;
    setContext({ currency });
  };

  cartQuantity = () => {
    const { cart } = this.context[0];
    let quantity = 0;
    for (let i = 0; i < cart.length; i++) {
      quantity += cart[i].quantity;
    }
    return quantity;
  };

  cartSum = () => {
    const { cart } = this.context[0];
    if (cart.length > 0) {
      let sum = 0;
      for (let i = 0; i < cart.length; i++) {
        const price = this.currentPrice(cart[i]).split(" ")[1];
        sum += cart[i].quantity * Number(price);
      }
      return parseFloat(sum).toFixed(2);
    }
  };

  currentPrice = (product) => {
    const { prices } = product;
    const { currency } = this.context[0];
    return Helper.currentPrice(prices, currency);
  };

  addToCart = (product) => {
    const { id, brand, name, prices, attributes, gallery, settings } = product;
    const cartProduct = { id, brand, name, prices, attributes, gallery };

    Helper.addToCart(this.context, cartProduct, settings);
  };

  reduceFromCart = (product) => {
    const { id, brand, name, prices, attributes, gallery, settings } = product;
    const cartProduct = { id, brand, name, prices, attributes, gallery };

    Helper.reduceFromCart(this.context, cartProduct, settings);
  };

  toggleCart = () => {
    const backdrop = document.querySelector(".modal__backdrop");
    const bStyle = backdrop.style;

    if (bStyle.display === "") {
      this.openCart();
    } else if (bStyle.display === "block") {
      this.closeCart();
    }
  };

  openCart = () => {
    const backdrop = document.querySelector(".modal__backdrop");
    const modal = document.querySelector(".cart__container");
    const bStyle = backdrop.style;
    const mStyle = modal.style;

    bStyle.display = "block";
    mStyle.display = "block";
  };

  closeCart = () => {
    const backdrop = document.querySelector(".modal__backdrop");
    const modal = document.querySelector(".cart__container");
    const bStyle = backdrop.style;
    const mStyle = modal.style;

    bStyle.display = "";
    mStyle.display = "";
  };

  exitCart = (event) => {
    const cart = document.getElementById("nav__cart");

    if (!cart.contains(event.target)) {
      this.closeCart();
    }
  };

  render() {
    const { loading } = this.state;
    const { currency, cart } = this.context[0];
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
          <li className="logo">
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
                      <div key={currency.symbol} className="nav__dropdown--item" onMouseDown={() => this.selectCurrency(currency.symbol)}>
                        {currency.symbol} {currency.label}
                      </div>
                    );
                  })}
                </div>
              </li>
              <li id="nav__cart">
                <div className="nav__cart--button" onClick={this.toggleCart}>
                  <img className="nav__cart--icon" src={cartImg} alt="Cart icon" />
                  {cart.length > 0 && (
                    <span className="nav__cart--dot">
                      <span className="nav__cart--dot--text">{this.cartQuantity()}</span>
                    </span>
                  )}
                </div>
                <div className="cart__container">
                  <div className="cart__contents">
                    <div className="cart__title">
                      my bag, <span className="cart__title--quantity">{this.cartQuantity()} items</span>
                    </div>
                    {cart.map((product, index) => {
                      const backgroundImg = product.gallery[0];
                      const img = { backgroundImage: `url(${backgroundImg})` };
                      return (
                        <div key={`cart_${product.id}${index}`} className="cart__item">
                          <div className="cart__item--details">
                            <div className="cart__item--brand-name">{product.brand}</div>
                            <div className="cart__item--brand-name">{product.name}</div>
                            <div className="cart__item--price">{this.currentPrice(product)}</div>
                            {product.attributes.map((att, index) => {
                              const type = att.type;
                              const setting = product.settings[index];
                              return (
                                <React.Fragment key={`${type} ${index}`}>
                                  <div className="cart__item--att">{att.id}:</div>
                                  <div className="cart__item-att-container ">
                                    {att.items.map((item) => {
                                      let style = { border: `1px solid ${item.value}` };
                                      let selected = "";
                                      const background = { background: `${item.value}` };
                                      if (item.displayValue === "White") style = { border: `1px solid #1d1f22` };
                                      if (setting.value === item.value) selected = "selected";
                                      return (
                                        <React.Fragment key={`${type} ${index} ${item.value}`}>
                                          {type === "text" && <div className={`cart__item--att-text ${selected}`}>{item.value}</div>}
                                          {type === "swatch" && (
                                            <div className={`cart__item--att-swatch-border ${selected}`}>
                                              <div className="spacer">
                                                <div style={style}>
                                                  <div className={`cart__item--att-swatch`} style={background} />
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </React.Fragment>
                                      );
                                    })}
                                  </div>
                                </React.Fragment>
                              );
                            })}
                          </div>
                          <div className="cart__item--end">
                            <div className="cart__item--quantity">
                              <button className="cart__item--quantity-button" onClick={() => this.addToCart(product)}>
                                +
                              </button>
                              <span className="cart__item--quantity--text">{product.quantity}</span>
                              <button className="cart__item--quantity-button" onClick={() => this.reduceFromCart(product)}>
                                &ndash;
                              </button>
                            </div>
                            <div className="cart__item--image" style={img} />
                          </div>
                        </div>
                      );
                    })}

                    <div className="cart__total">
                      total
                      <span className="cart__total--sum">{this.cartSum()}</span>
                    </div>
                    <div className="cart__button--container">
                      <button className="cart__button cart__button--bag">view bag</button>
                      <button className="cart__button cart__button--checkout">check out</button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </ul>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
