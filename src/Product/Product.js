import React from "react";
import { client, Field, Query } from "@tilework/opus";
import Helper from "../Helper";
import { AppContext } from "../Context";

class Product extends React.Component {
  static contextType = AppContext;
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
    console.log("component mounted: " + this.props.match.params.id);
    this.fetchProductData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.fetchProductData();
    }
  }

  async fetchProductData() {
    const id = this.props.match.params.id;

    const query = new Query("product", true);
    query
      .addArgument("id", "String!", id)
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
      .post(query)
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
        this.setState({ error: err.message, loading: false });
      });
  }

  changeSrc = (img) => {
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
              // = bigImg === img ? "product__gallery--item-border" : "";
              return (
                <div
                  key={`img${index}`}
                  className={`product__gallery--item ${borderClass}`}
                  style={this.backgroundImgStyle(img)}
                  onClick={() => this.changeSrc(img)}
                  alt={`${brand} ${name} ${index}`}
                />
              );
            })}
          </div>
          <div>
            <img className="product__bigImg" src={bigImg} alt={name} />
          </div>
          <div className="product__dsc">
            <div className="product__dsc--brand">{brand}</div>
            <div className="product__dsc--name">{name}</div>
            <div className="product__dsc--attributes">
              {attributes.map((a, index) => {
                const type = a.type;
                const container = `${type}__container`;
                return (
                  <React.Fragment key={`product att ${a.id}`}>
                    <div className="product__dsc--attributes-type">{a.id}:</div>
                    <div className={container}>
                      {a.items.map((item) => {
                        let style = { border: `1px solid ${item.value}` };
                        const borderClass = item.value === settings[index].value ? "selected" : "";
                        const swatchStyle = { backgroundColor: item.value };

                        if (item.displayValue === "White") style = { border: `1px solid #1d1f22` };
                        return (
                          <React.Fragment key={`${type} ${item.id}`}>
                            {type === "text" && (
                              <div className={`text__item ${borderClass}`} onClick={() => this.changeSettings(a.id, item.value)}>
                                <div className="text__item--text">{item.value}</div>
                              </div>
                            )}
                            {type === "swatch" && (
                              <div className={`swatch__item--border ${borderClass}`} onClick={() => this.changeSettings(a.id, item.value)}>
                                <div className="swatch__item--spacer">
                                  <div style={style}>
                                    <div className="swatch__item" style={swatchStyle} />
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
            <div className="product__dsc--attributes-type">Price:</div>
            <div className="product__dsc--price">{this.currentPrice()}</div>
            <button className={`product__dsc--button ${oos}`} onClick={this.addToCart} disabled={!inStock}>
              <div className="product__dsc--button-text">{inStock ? "add to cart" : "out of stock"}</div>
            </button>
            <div className="product__dsc--dsc">
              <div dangerouslySetInnerHTML={{ __html: description }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Product;
