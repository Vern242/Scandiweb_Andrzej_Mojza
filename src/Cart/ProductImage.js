import React from "react";

class ProductImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      galleryPosition: 0,
    };
  }

  changeImage = (direction) => {
    const galleryLength = this.props.gallery.length;
    const currentPosition = this.state.galleryPosition;
    if (galleryLength < 2) return;
    let final = 0;
    if (direction === "<") {
      final = currentPosition - 1;
      if (final < 0) final += galleryLength;
    }
    if (direction === ">") {
      final = currentPosition + 1;
      if (final >= galleryLength) final -= galleryLength;
    }
    this.setState({ galleryPosition: final });
  };

  render() {
    const { gallery } = this.props;
    const { galleryPosition } = this.state;
    const imgStyle = { backgroundImage: `URL(${gallery[galleryPosition]})` };
    return (
      <div className="cart__img" style={imgStyle}>
        <div className="cart__imgButtonContainer ">
          <button className="cart__imgButton" onClick={() => this.changeImage("<")}>
            <span className="imgButton__arrow imgButton__arrow--left"></span>
          </button>
          <button className="cart__imgButton" onClick={() => this.changeImage(">")}>
            <span className="imgButton__arrow imgButton__arrow--right"></span>
          </button>
        </div>
      </div>
    );
  }
}

export default ProductImage;
