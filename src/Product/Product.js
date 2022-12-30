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
    if (prevProps.match.params.settings !== this.props.match.params.settings) {
      const { attributes, settings } = this.state;
      const urlSettings = this.getSettingsFromParameters(attributes);
      const url = JSON.stringify(urlSettings);
      const state = JSON.stringify(settings);

      if (url !== state) {
        const newSettings = this.verifySettings(urlSettings, attributes);
        this.setState({ settings: newSettings });
      }
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
        const urlSettings = this.getSettingsFromParameters(p.attributes);
        const settings = this.verifySettings(urlSettings, p.attributes);
        this.changeURL(settings, p.id);

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

  getSettingsFromParameters = (attributes) => {
    const params = this.props.match.params.settings;
    if (typeof params === "undefined") {
      return [];
    }
    let settings = params.replace(/_+/g, " ");
    settings = settings.split("&");
    const urlSettings = [];
    for (let i = 0; i < settings.length; i++) {
      let id = settings[i].split("=")[0];
      let value = settings[i].split("=")[1];
      urlSettings.push({ id, value });
    }
    this.addHashToSwatch(urlSettings, attributes);
    return urlSettings;
  };

  addHashToSwatch = (urlSettings, attributes) => {
    for (let i = 0; i < attributes.length; i++) {
      const { type, id: a_id } = attributes[i];
      if (type === "swatch") {
        for (let j = 0; j < urlSettings.length; j++) {
          const { id: s_id } = urlSettings[j];
          if (a_id === s_id) {
            urlSettings[j].value = "#" + urlSettings[j].value;
          }
        }
      }
    }
  };

  verifySettings = (urlSettings, attributes) => {
    const verifiedSettings = [];
    for (let i = 0; i < attributes.length; i++) {
      let found = false;
      for (let j = 0; j < urlSettings.length && !found; j++) {
        if (attributes[i].id === urlSettings[j].id) {
          const { value } = urlSettings[j];
          let exit = false;
          for (let k = 0; k < attributes[i].items.length && !exit; k++) {
            if (attributes[i].items[k].value === value) {
              verifiedSettings.push({ id: urlSettings[j].id, value });
              exit = true;
            }
          }
          if (!exit) {
            const id = attributes[i].id;
            const value = attributes[i].items[0].value;
            verifiedSettings.push({ id, value });
          }
          urlSettings.splice(j, 1);
          found = true;
        }
      }
      if (!found) {
        const id = attributes[i].id;
        const value = attributes[i].items[0].value;
        verifiedSettings.push({ id, value });
      }
    }
    return verifiedSettings;
  };

  urlizeSettings = (settings, productId) => {
    let url = `/products/${productId}/`;
    let spacer = "";
    for (let i = 0; i < settings.length; i++) {
      if (i !== 0) spacer = "&";
      const { id, value } = settings[i];
      url += `${spacer}${id}=${value}`;
    }
    url = url.replace(/\s+/g, "_");
    url = url.replace(/#+/g, "");
    return url;
  };

  changeURL = (settings, productId) => {
    const url = this.urlizeSettings(settings, productId);
    const { location } = this.props;

    if (location.pathname !== url) {
      this.props.history.push(url);
    }
  };

  changeBigImg = (img) => {
    this.setState({ bigImg: img });
  };

  changeSettings = (id, value) => {
    const { settings } = this.state;
    for (let i = 0; i < settings.length; i++) {
      if (settings[i].id === id) {
        settings[i].value = value;
        this.setState({ settings: settings });
        this.changeURL(settings, this.state.id);
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
    return Helper.currentPriceWithoutSpaces(prices, currency);
  };

  addToCart = () => {
    const { id, brand, name, prices, attributes, gallery, settings } = this.state;
    const product = { id, brand, name, prices, attributes, gallery };

    Helper.showCartMessage();
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
                <div className="product__galleryImgContainer" key={`img${index}`}>
                  <div
                    className={`product__galleryImage ${borderClass}`}
                    style={this.backgroundImgStyle(img)}
                    onClick={() => this.changeBigImg(img)}
                    alt={`${brand} ${name} ${index}`}
                  />
                </div>
              );
            })}
          </div>
          <div>
            <div className="product__imgContainer">
              <img className="product__bigImg" src={bigImg} alt={name} />
            </div>
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
