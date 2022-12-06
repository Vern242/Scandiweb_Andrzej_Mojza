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

    return (
      <div className="product__card">
        <Link className="product__card--link" to={link}>
          <div className={inStock ? "" : "product__card--opacity"}>
            <div className="product__card--imgContainer">
              {!inStock && <span className="product__card--oos">Out of stock</span>}
              <div className="product__card--backgroundImg" style={imageStyle} />
            </div>
          </div>
          <div className="product__card--desc">
            <div className="product__card--name">
              {brand} {name}
            </div>
            <div className="product__card--price">{this.currentPrice()}</div>
          </div>
        </Link>
        <button className="product__card--button" onClick={this.addToCart} disabled={!inStock}>
          <img className="product__card--cart" src={cartImg} alt="add to cart" />
        </button>
      </div>
    );
  }
}

export default CategoryProduct;
