import React from "react";
import { client, Field, Query } from "@tilework/opus";
import Helper from "../Helper";
import { AppContext } from "../Context";

class Product extends React.Component {
  static contextType = AppContext;
  controller = new AbortController();
  constructor(props) {
    super(props);
    this.state = {
      id: "",
      name: "",
      inStock: false,
      gallery: [],
      description: "",
      category: "",
      brand: "",
      attributes: [],
      error: "",
      loading: true,
      bigImg: "",
      prices: [],
      settings: [],
    };
  }

  componentDidMount() {
    console.log("Mounted: Product");
    this.fetchProductData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.controller.abort();
      this.controller = new AbortController();

      this.fetchProductData();
      console.log("Updated: Product");
    }
  }

  componentWillUnmount() {
    console.log("Aborted: Product");
    this.controller.abort();
  }

  async fetchProductData() {
    const query = new Query("product", true);
    query
      .addArgument("id", "String!", this.props.match.params.id)
      .addField("id")
      .addField("name")
      .addField("inStock")
      .addField("gallery")
      .addField("description")
      .addField("category")
      .addField("brand")
      .addField(
        new Field("attributes")
          .addField("id")
          .addField("name")
          .addField("type")
          .addField(new Field("items").addField("displayValue").addField("value").addField("id"))
      )
      .addField(new Field("prices").addField("amount").addField(new Field("currency").addField("label").addField("symbol")));

    client
      .post(query, { signal: this.controller.signal })
      .then((res) => res.product)
      .then((p) => {
        const settings = [];
        p.attributes.forEach((att) => {
          const id = att.id;
          const value = att.items[0].value;
          settings.push({ id, value });
        });
        this.updateCurrentCategory(p.category);
        this.setState({
          id: p.id,
          name: p.name,
          inStock: p.inStock,
          gallery: p.gallery,
          description: p.description,
          category: p.category,
          brand: p.brand,
          attributes: p.attributes,
          error: "",
          loading: false,
          bigImg: p.gallery[0],
          prices: p.prices,
          settings: settings,
        });
      })
      .catch((err) => {
        if (err?.name === "AbortError") {
          return undefined;
        }
        this.setState({ error: err.message, loading: false });
        console.log(err.message);
      });
  }

  changeBigImg = (img) => {
    this.setState({ bigImg: img });
  };

  changeSettings = (id, value) => {
    const settings = this.state.settings;
    for (let i = 0; i < settings.length; i++) {
      if (settings[i].id === id) {
        settings[i].value = value;
        this.setState({ settings: settings });
        return;
      }
    }
  };

  backgroundImgStyle = (img) => {
    return { backgroundImage: `url(${img})` };
  };

  currentPrice = () => {
    const { prices } = this.state;
    const { currency } = this.context[0];
    return Helper.currentPrice(prices, currency);
  };

  addToCart = () => {
    const { id, brand, name, prices, attributes, gallery, settings } = this.state;
    const product = { id, brand, name, prices, attributes, gallery };

    Helper.addToCart(this.context, product, settings);
  };

  updateCurrentCategory = (category) => {
    Helper.updateCurrentCategory(category, this.context);
  };

  render() {
    const { loading, error, name, inStock, gallery, description, brand, attributes, bigImg, settings } = this.state;
    const oos = inStock ? "" : "oos";
    if (loading) return <></>;
    if (error === "p is null")
      return (
        <div className="category">
          <div className="category__name">Couldn't find the product: {this.props.match.params.id}</div>
        </div>
      );
    if (error)
      return (
        <div className="category">
          <div className="category__name">{error}</div>
        </div>
      );
    return (
      <div className="product">
        <div className="product__container">
          <div className="product__gallery">
            {gallery.map((img, index) => {
              const borderClass = "";
              // = bigImg === img ? "product__galleryImageBorder" : "";
              return (
                <div
                  key={`img${index}`}
                  className={`product__galleryImage ${borderClass}`}
                  style={this.backgroundImgStyle(img)}
                  onClick={() => this.changeBigImg(img)}
                  alt={`${brand} ${name} ${index}`}
                />
              );
            })}
          </div>
          <div>
            <img className="product__bigImg" src={bigImg} alt={name} />
          </div>
          <div className="product__info">
            <div className="product__brand">{brand}</div>
            <div className="product__name">{name}</div>
            <div className="product__attributes">
              {attributes.map((att, index) => {
                const type = att.type;
                const container = `product__${type}Container`;
                const setting = settings[index];
                return (
                  <React.Fragment key={`product attribute ${att.id}`}>
                    <div className="product__attributeType">{att.id}:</div>
                    <div className={container}>
                      {att.items.map((item) => {
                        let style = { border: `1px solid ${item.value}` };
                        let selected = "";
                        const background = { background: `${item.value}` };
                        if (item.displayValue === "White") style = { border: `1px solid #1d1f22` };
                        if (setting.value === item.value) selected = "selected";
                        return (
                          <React.Fragment key={`${type} ${item.id}`}>
                            {type === "text" && (
                              <div className={`product__text ${selected}`} onClick={() => this.changeSettings(att.id, item.value)}>
                                <div className="product__textValue">{item.value}</div>
                              </div>
                            )}
                            {type === "swatch" && (
                              <div className={`product__swatchBorder ${selected}`} onClick={() => this.changeSettings(att.id, item.value)}>
                                <div className="spacer">
                                  <div style={style}>
                                    <div className={`product__swatch`} style={background} />
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
            <div className="product__attributeType">Price:</div>
            <div className="product__price">{this.currentPrice()}</div>
            <button className={`product__button ${oos}`} onClick={this.addToCart} disabled={!inStock}>
              <div className="product__buttonText">{inStock ? "add to cart" : "out of stock"}</div>
            </button>
            <div className="product__description">
              <div dangerouslySetInnerHTML={{ __html: description }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Product;
