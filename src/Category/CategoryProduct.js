//zmiana kasy przy innym currency wybranym
import React from "react";
import cart from "../Images/Card_cart.png";
import { Link } from "react-router-dom";

class CategoryProduct extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      link: `/products/${this.props.product.id}`,
    };

    this.addToCart = this.addToCart.bind(this);
  }

  addToCart(event) {
    console.log(this.props.product.name);
  }

  render() {
    const { product } = this.props;
    const { link } = this.state;
    const { name, gallery, brand, prices, inStock } = product;
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
            <div className="product__card--price">
              {prices[0].currency.symbol}
              {prices[0].amount}
            </div>
          </div>
        </Link>
        <button className="product__card--button" onClick={this.addToCart} disabled={!inStock}>
          <img className="product__card--cart" src={cart} alt="add to cart" />
        </button>
      </div>
    );
  }
}

export default CategoryProduct;
