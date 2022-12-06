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

  addToCart = () => {};

  reduceFromCart = () => {};

  changeImg = (imgStyle, gallery, direction) => {
    const url = imgStyle.backgroundImage.split("(")[1].split(")")[0];
    let position = undefined;
    for (let i = 0; i < gallery.length; i++) {
      if (url === gallery[i]) position = i;
    }
    console.log(position);
    imgStyle = { backgroundImage: `URL(${gallery[position + 1]})` };
  };

  currentPrice = (prices) => {
    const { currency } = this.context[0];
    return Helper.currentPrice(prices, currency);
  };

  cartTax = () => {
    const { currency } = this.context[0];
    const sum = this.cartSum();
    const num = sum.split(currency)[1];
    return currency + (num * 0.21).toFixed(2);
  };

  cartSum = () => {
    const sum = Helper.cartSum(this.context);
    if (sum === 0) return `${this.context[0].currency}0.00`;
    return sum;
  };

  cartQuantity = () => {
    return Helper.cartQuantity(this.context);
  };

  render() {
    const { cart, currency } = this.context[0];
    return (
      <div className="cart">
        <div className="cart__name">cart</div>
        {cart.map((item, index) => {
          return (
            <React.Fragment key={`cart ${item.id} ${index}`}>
              <hr className="cart__line" />
              <div className="cart__item">
                <div className="cart__itemSettings">
                  <div className="cart__brand">{item.brand}</div>
                  <div className="cart__itemName">{item.name}</div>
                  <div className="cart__price">{this.currentPrice(item.prices)}</div>
                  {/* attributes mapped*/}
                </div>
                <div className="cart__itemEnd">
                  <div className="cart__quantity">
                    <div className="cart__quantity--button">
                      <span className="cart__plus">+</span>
                    </div>
                    <div className="cart__quantity--text">{item.quantity}</div>
                    <div className="cart__quantity--button">
                      <span className="cart__minus">&ndash;</span>
                    </div>
                  </div>
                  <ProductImage gallery={item.gallery} />
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
