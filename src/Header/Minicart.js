import React from "react";
import cartImg from "../Images/Empty_cart.png";
import { Link } from "react-router-dom";
import Helper from "../utils/Helper";
import { AppContext } from "../Context";

class Minicart extends React.Component {
  static contextType = AppContext;
  componentDidMount() {
    document.body.addEventListener("mousedown", this.exitMinicart);
    this.loadCartFromStorage();
  }

  loadCartFromStorage = () => {
    const cartFromStorage = Helper.loadCartFromStorage(this.context[1]);
    Helper.addToCartFromStorage(this.context, cartFromStorage);
  };

  cartQuantity = () => {
    return Helper.cartQuantity(this.context);
  };

  cartSum = () => {
    const sum = Helper.cartSum(this.context);

    if (sum === 0) return `${this.context[0].currency}0.00`;
    else return sum;
  };

  currentPrice = (product) => {
    const { prices } = product;
    const { currency } = this.context[0];

    return Helper.currentPriceWithoutSpaces(prices, currency);
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
    const minicart = document.querySelector(".minicart__container");
    const minicartItems = document.querySelector(".minicart__itemContainer");
    minicartItems.scrollTo(0, 0);

    backdrop.classList.toggle("open");
    minicart.classList.toggle("open");
  };

  closeMinicart = () => {
    const backdrop = document.querySelector(".modal__backdrop");
    const minicart = document.querySelector(".minicart__container");
    const minicartItems = document.querySelector(".minicart__itemContainer");
    minicartItems.scrollTo(0, 0);

    if (!minicart.classList.contains("open")) return;

    backdrop.classList.toggle("open");
    minicart.classList.toggle("open");
  };

  exitMinicart = (event) => {
    const cart = document.getElementById("nav__minicart");

    if (!cart.contains(event.target)) this.closeMinicart();
  };

  calcCartHeight = () => {
    const { cart } = this.context[0];
    if (cart.length === 0) return;

    const baseProductHeight = 80;
    const noAttributesBaseProductHeight = 96;
    const textAttributeHeight = 62;
    const swatchAttributeHeight = 60;
    const productGap = 40;
    let totalHeight = 0;

    for (const product of cart) {
      if (product.attributes.length < 1) {
        totalHeight += noAttributesBaseProductHeight;
      } else {
        totalHeight += baseProductHeight;
      }

      for (const attribute of product.attributes) {
        if (attribute.type === "text") totalHeight += textAttributeHeight;
        if (attribute.type === "swatch") totalHeight += swatchAttributeHeight;
      }
    }
    totalHeight += productGap * (cart.length - 1);

    return totalHeight;
  };

  render() {
    const { cart } = this.context[0];
    const scroll = this.calcCartHeight() > 550 ? "scroll" : "auto";

    return (
      <li id="nav__minicart">
        <div className="minicart__navButton" onClick={this.toggleMinicart}>
          <img className="minicart__navIcon" src={cartImg} alt="Minicart" />
          {cart.length > 0 && (
            <span className="minicart__navDot">
              <span className="minicart__navDotText">{this.cartQuantity()}</span>
            </span>
          )}
        </div>
        <div className="minicart__container">
          <div className="minicart__contents">
            <div className="minicart__title">
              my bag, <span className="minicart__titleQuantity">{this.cartQuantity()} items</span>
            </div>
            <div className={`minicart__itemContainer ${scroll}`}>
              {cart.length === 0 && <div className="minicart__empty">Your items will be displayed here</div>}
              {cart.map((product, index, arr) => {
                const gap = index + 1 !== arr.length ? "gap" : "";
                const backgroundImg = product.gallery[0];
                const img = { backgroundImage: `url(${backgroundImg})` };

                return (
                  <div key={`minicart_${product.id}${index}`} className={`minicart__item ${gap}`}>
                    <div className="minicart__itemDetails">
                      <div className="minicart__itemBrandName">{product.brand}</div>
                      <div className="minicart__itemBrandName">{product.name}</div>
                      <div className="minicart__itemPrice">{this.currentPrice(product)}</div>
                      {product.attributes.map((att, index) => {
                        const type = att.type;
                        const setting = product.settings[index];

                        return (
                          <React.Fragment key={`${type} ${index}`}>
                            <div className="minicart__attributeName">{att.id}:</div>
                            <div className="minicart__attributeContainer">
                              {att.items.map((item) => {
                                const background = { background: `${item.value}` };
                                let selected = "";
                                let blackBorder = "minicart__notWhiteSwatch";

                                if (item.id === "White") blackBorder = "minicart__whiteSwatch";
                                if (setting.value === item.value) selected = "selected";

                                return (
                                  <React.Fragment key={`${type} ${index} ${item.value}`}>
                                    {type === "text" && <div className={`minicart__text ${selected}`}>{item.value}</div>}
                                    {type === "swatch" && (
                                      <div className={`minicart__swatchBorder ${selected}`}>
                                        <div className="minicart__swatchSpacer">
                                          <div className={blackBorder}>
                                            <div className="minicart__swatch" style={background} />
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
                    <div className="minicart__itemEnd">
                      <div className="minicart__quantity">
                        <button className="minicart__quantityButton" onClick={() => this.addToCart(product)}>
                          <span className="minicart__plus">+</span>
                        </button>
                        <span className="minicart__quantityText">{product.quantity}</span>
                        <button className="minicart__quantityButton" onClick={() => this.reduceFromCart(product)}>
                          <span className="minicart__minus">&ndash;</span>
                        </button>
                      </div>
                      <div className="minicart__image" style={img} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="minicart__total">
              total
              <span className="minicart__sum">{this.cartSum()}</span>
            </div>
            <div className="minicart__buttonContainer">
              <Link className="minicart__link" to={"/cart"} onClick={this.closeMinicart}>
                <button className="minicart__button minicart__button--bag">view bag</button>
              </Link>
              <Link className="minicart__link" to={"/checkout"} onClick={this.closeMinicart}>
                <button className="minicart__button minicart__button--checkout" disabled={cart.length === 0}>
                  check out
                </button>
              </Link>
            </div>
          </div>
        </div>
      </li>
    );
  }
}

export default Minicart;
