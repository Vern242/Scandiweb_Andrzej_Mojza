import React from "react";
import Helper from "../Helper";
import { AppContext } from "../Context";
import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";

class Cart extends React.Component {
  static contextType = AppContext;
  controller = new AbortController();
  constructor(props) {
    super(props);
    this.state = {
      category: {},
      products: [],
      loading: true,
      error: undefined,
    };
  }

  addToCart = (product) => {
    Helper.addToCart(this.context, product, product.settings);
  };

  reduceFromCart = (product) => {
    Helper.reduceFromCart(this.context, product, product.settings);
  };

  currentPrice = (prices) => {
    const { currency } = this.context[0];
    return Helper.currentPriceWithoutSpaces(prices, currency);
  };

  cartTax = () => {
    const { currency } = this.context[0];
    const sum = this.cartSum();
    const num = sum.split(currency)[1];
    return currency + (num * 0.21).toFixed(2);
  };

  cartSum = () => {
    const { currency } = this.context[0];
    const sum = Helper.cartSum(this.context);
    if (sum === 0) return `${currency}0.00`;
    return sum;
  };

  cartQuantity = () => {
    return Helper.cartQuantity(this.context);
  };

  render() {
    const { cart } = this.context[0];
    return (
      <div className="cart">
        <div className="cart__name">cart</div>
        {cart.map((product, index) => {
          return (
            <React.Fragment key={`cart ${product.id} ${index}`}>
              <hr className="cart__line" />
              <div className="cart__item">
                <div className="cart__itemSettings">
                  <div className="cart__brand">{product.brand}</div>
                  <div className="cart__itemName">{product.name}</div>
                  <div className="cart__price">{this.currentPrice(product.prices)}</div>
                  {product.attributes.map((att, index) => {
                    const type = att.type;
                    const setting = product.settings[index];
                    return (
                      <React.Fragment key={`cart att ${index}`}>
                        <div className="cart__attributeName">{att.name}:</div>
                        <div className="cart__attributeContainer">
                          {att.items.map((item, index) => {
                            let style = { border: `1px solid ${item.value}` };
                            let selected = "";
                            const background = { background: `${item.value}` };
                            if (item.displayValue === "White") style = { border: `1px solid #1d1f22` };
                            if (setting.value === item.value) selected = "selected";
                            return (
                              <React.Fragment key={`att${index} item${index}`}>
                                {type === "text" && <div className={`cart__text ${selected}`}>{item.value}</div>}
                                {type === "swatch" && (
                                  <div className={`cart__swatchBorder ${selected}`}>
                                    <div className="spacer">
                                      <div style={style}>
                                        <div className={`cart__swatch`} style={background} />
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
                <div className="cart__itemEnd">
                  <div className="cart__quantity">
                    <div className="cart__quantityButton" onClick={() => this.addToCart(product)}>
                      <span className="cart__plus">+</span>
                    </div>
                    <div className="cart__quantityText">{product.quantity}</div>
                    <div className="cart__quantityButton" onClick={() => this.reduceFromCart(product)}>
                      <span className="cart__minus">&ndash;</span>
                    </div>
                  </div>
                  <ProductImage gallery={product.gallery} />
                </div>
              </div>
            </React.Fragment>
          );
        })}
        {cart.length > 0 && <hr className="cart__line" />}
        <div className="cart__overview">
          <div className="cart__overviewBlock">
            <div className="cart__dsc">tax 21%:</div>
            <div className="cart__dsc">quantity:</div>
            <div className="cart__total">total:</div>
          </div>
          <div className="cart__overviewBlock">
            <div className="cart__dsc cart__dsc--bold">{this.cartTax()}</div>
            <div className="cart__dsc cart__dsc--bold">{this.cartQuantity()}</div>
            <div className="cart__total cart__total--bold">{this.cartSum()}</div>
          </div>
        </div>
        <Link to={"/checkout"}>
          <button className="cart__orderButton" disabled={cart.length === 0}>
            order
          </button>
        </Link>
      </div>
    );
  }
}

export default Cart;
