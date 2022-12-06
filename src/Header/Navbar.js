import React from "react";
import logoImg from "../Images/Brand_icon.png";
import cartImg from "../Images/Empty_cart.png";
import { Link, NavLink } from "react-router-dom";
import Helper from "../Helper";
import { AppContext } from "../Context";

//      turn cart into another component - create another css file for it
//      fix cart buttons to scale in width

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
    document.body.addEventListener("mousedown", this.exitMinicart);
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
    buttonStyle["padding-top"] = "6px";
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

    const [context, setContext] = this.context;
    if (context.currency === symbol) return;
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
    const sum = Helper.cartSum(this.context);
    if (sum === 0) return `${this.context[0].currency}0.00`;
    else return sum;
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

  toggleMinicart = () => {
    const backdrop = document.querySelector(".modal__backdrop");
    const bStyle = backdrop.style;

    if (bStyle.display === "") {
      this.openMinicart();
    } else if (bStyle.display === "block") {
      this.closeMinicart();
    }
  };

  openMinicart = () => {
    const backdrop = document.querySelector(".modal__backdrop");
    const modal = document.querySelector(".minicart__container");
    const bStyle = backdrop.style;
    const mStyle = modal.style;

    bStyle.display = "block";
    mStyle.display = "block";
  };

  closeMinicart = () => {
    const backdrop = document.querySelector(".modal__backdrop");
    const modal = document.querySelector(".minicart__container");
    const bStyle = backdrop.style;
    const mStyle = modal.style;

    bStyle.display = "";
    mStyle.display = "";
  };

  exitMinicart = (event) => {
    const cart = document.getElementById("nav__minicart");

    if (!cart.contains(event.target)) {
      this.closeMinicart();
    }
  };

  render() {
    const { loading } = this.state;
    const { currency, cart, currentCategory } = this.context[0];
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
              <li id="nav__minicart">
                <div className="nav__minicart--button" onClick={this.toggleMinicart}>
                  <img className="nav__minicart--icon" src={cartImg} alt="Minicart icon" />
                  {cart.length > 0 && (
                    <span className="nav__minicart--dot">
                      <span className="nav__minicart--dot--text">{this.cartQuantity()}</span>
                    </span>
                  )}
                </div>
                <div className="minicart__container">
                  <div className="minicart__contents">
                    <div className="minicart__title">
                      my bag, <span className="minicart__title--quantity">{this.cartQuantity()} items</span>
                    </div>
                    <div className={`minicart__item--container scroll`}>
                      {cart.length === 0 && <div className="minicart__item--empty">Your items will be displayed here</div>}
                      {cart.map((product, index, arr) => {
                        const gap = index + 1 !== arr.length ? "gap" : "";
                        const backgroundImg = product.gallery[0];
                        const img = { backgroundImage: `url(${backgroundImg})` };
                        return (
                          <div key={`minicart_${product.id}${index}`} className={`minicart__item ${gap}`}>
                            <div className="minicart__item--details">
                              <div className="minicart__item--brand-name">{product.brand}</div>
                              <div className="minicart__item--brand-name">{product.name}</div>
                              <div className="minicart__item--price">{this.currentPrice(product)}</div>
                              {product.attributes.map((att, index) => {
                                const type = att.type;
                                const setting = product.settings[index];
                                return (
                                  <React.Fragment key={`${type} ${index}`}>
                                    <div className="minicart__item--att">{att.id}:</div>
                                    <div className="minicart__item-att-container ">
                                      {att.items.map((item) => {
                                        let style = { border: `1px solid ${item.value}` };
                                        let selected = "";
                                        const background = { background: `${item.value}` };
                                        if (item.displayValue === "White") style = { border: `1px solid #1d1f22` };
                                        if (setting.value === item.value) selected = "selected";
                                        return (
                                          <React.Fragment key={`${type} ${index} ${item.value}`}>
                                            {type === "text" && <div className={`minicart__item--att-text ${selected}`}>{item.value}</div>}
                                            {type === "swatch" && (
                                              <div className={`minicart__item--att-swatch-border ${selected}`}>
                                                <div className="spacer">
                                                  <div style={style}>
                                                    <div className={`minicart__item--att-swatch`} style={background} />
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
                            <div className="minicart__item--end">
                              <div className="minicart__item--quantity">
                                <button className="minicart__item--quantity-button" onClick={() => this.addToCart(product)}>
                                  +
                                </button>
                                <span className="minicart__item--quantity-text">{product.quantity}</span>
                                <button className="minicart__item--quantity-button" onClick={() => this.reduceFromCart(product)}>
                                  &ndash;
                                </button>
                              </div>
                              <div className="minicart__item--image" style={img} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="minicart__total">
                      total
                      <span className="minicart__total--sum">{this.cartSum()}</span>
                    </div>
                    <div className="minicart__button--container">
                      <Link className="minicart__link" to={"/cart"} onClick={this.closeMinicart}>
                        <button className="minicart__button minicart__button--bag" disabled={cart.length === 0}>
                          view bag
                        </button>
                      </Link>
                      <Link className="minicart__link" to={"/checkout"}>
                        <button className="minicart__button minicart__button--checkout" disabled={cart.length === 0}>
                          check out
                        </button>
                      </Link>
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
