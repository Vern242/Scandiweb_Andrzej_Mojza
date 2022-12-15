import React from "react";
import cartImg from "../Images/Card_cart.png";
import { Link } from "react-router-dom";
import { AppContext } from "../Context";
import Helper from "../Helper";

class CategoryProduct extends React.Component {
  static contextType = AppContext;

  addToCart = () => {
    const { id, brand, name, prices, attributes, gallery, settings } = this.props.product;
    const product = { id, brand, name, prices, attributes, gallery };

    Helper.addToCart(this.context, product, settings);
  };

  currentPrice = () => {
    const { prices } = this.props.product;
    const { currency } = this.context[0];

    return Helper.currentPrice(prices, currency);
  };

  render() {
    const { product } = this.props;
    const link = `/products/${product.id}`;
    const { name, gallery, brand, inStock } = product;
    const imageStyle = { backgroundImage: `url(${gallery[0]})` };
    const isOutOfStock = inStock ? "" : "opacity";

    return (
      <div className={`product__card ${isOutOfStock}`}>
        <Link className="card__link" to={link}>
          <div className={inStock ? "" : "card__opacity"}>
            <div className="card__imgContainer">
              {!inStock && <span className="card__oos">Out of stock</span>}
              <div className="card__backgroundImg" style={imageStyle} />
            </div>
          </div>
          <div className="card__desc">
            <div className="card__name">
              {brand} {name}
            </div>
            <div className="card__price">{this.currentPrice()}</div>
          </div>
        </Link>
        <button className="card__button" onClick={this.addToCart} disabled={!inStock}>
          <img className="card__cart" src={cartImg} alt="add to cart" />
        </button>
      </div>
    );
  }
}

export default CategoryProduct;
