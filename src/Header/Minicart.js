import React from "react";
import cartImg from "../Images/Empty_cart.png";
import { Link } from "react-router-dom";
import Helper from "../Helper";
import { AppContext } from "../Context";
import { client, Field, Query } from "@tilework/opus";

class Minicart extends React.Component {
  static contextType = AppContext;

  componentDidMount() {
    document.body.addEventListener("mousedown", this.exitMinicart);
    this.loadCartFromStorage();
  }

  loadCartFromStorage = async () => {
    const storageCart = Helper.loadCartFromStorage(this.context[1]);
    const queries = [];
    for (let i = 0; i < storageCart.length; i++) {
      const query = new Query("product", true);
      query
        .addArgument("id", "String!", storageCart[i]?.id)
        .addField("id")
        .addField("brand")
        .addField("name")
        .addField("inStock")
        .addField("gallery")
        .addField("description")
        .addField("category")

        .addField(
          new Field("attributes")
            .addField("id")
            .addField("name")
            .addField("type")
            .addField(new Field("items").addField("displayValue").addField("value").addField("id"))
        )
        .addField(new Field("prices").addField("amount").addField(new Field("currency").addField("label").addField("symbol")));
      queries.push(client.post(query));
    }
    //update to singular server query with multiple IDs as argument when available
    const fetchedProducts = await Promise.all(queries);
    const verifiedCart = Helper.verifyCart(storageCart, fetchedProducts);
    Helper.addToCartFromStorage(this.context, verifiedCart);
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

  calcCartHeight = () => {
    const { cart } = this.context[0];
    const baseProductHeight = 80;
    const textAttributeHeight = 60;
    const swatchAttributeHeight = 56;
    const productGap = 40;
    let totalHeight = 0;
    for (let i = 0; i < cart.length; i++) {
      totalHeight += baseProductHeight;
      for (let j = 0; j < cart[i].attributes.length; j++) {
        if (cart[i].attributes[j].type === "text") totalHeight += textAttributeHeight;
        if (cart[i].attributes[j].type === "swatch") totalHeight += swatchAttributeHeight;
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
                                let style = { border: `1px solid ${item.value}` };
                                let selected = "";
                                const background = { background: `${item.value}` };
                                if (item.displayValue === "White") style = { border: `1px solid #1d1f22` };
                                if (setting.value === item.value) selected = "selected";
                                return (
                                  <React.Fragment key={`${type} ${index} ${item.value}`}>
                                    {type === "text" && <div className={`minicart__text ${selected}`}>{item.value}</div>}
                                    {type === "swatch" && (
                                      <div className={`minicart__swatchBorder ${selected}`}>
                                        <div className="spacer">
                                          <div style={style}>
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
                          +
                        </button>
                        <span className="minicart__quantityText">{product.quantity}</span>
                        <button className="minicart__quantityButton" onClick={() => this.reduceFromCart(product)}>
                          &ndash;
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
