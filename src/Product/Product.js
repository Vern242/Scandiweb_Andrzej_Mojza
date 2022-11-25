import React from "react";
import { client, Field, Query } from "@tilework/opus";

//dodac abortSignaller na unmount -- anuluj przed przejsciem do innej kategori
//wyczyscic kod

client.setEndpoint("http://localhost:4000/graphql");

class Product extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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

    this.changeSrc = this.changeSrc.bind(this);
    this.changeSettings = this.changeSettings.bind(this);
    this.backgroundImgStyle = this.backgroundImgStyle.bind(this);
  }

  componentDidMount() {
    console.log("component mounted: " + this.props.match.params.id);
    this.fetchProductData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) this.fetchProductData();
  }

  componentWillUnmount() {
    const navCategory = document.getElementById(this.state.category);
    navCategory.classList.toggle("nav__link--border");
  }

  activateCategoryBorder(categoryName) {
    const navCategory = document.getElementById(categoryName);
    navCategory.classList.add("nav__link--border");
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
        this.setState({
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
        this.activateCategoryBorder(p.category);
      })
      .catch((err) => {
        this.setState({ error: err.message });
      });
  }

  changeSrc(img) {
    this.setState({ bigImg: img });
  }

  changeSettings(id, value) {
    const settings = this.state.settings;
    for (let i = 0; i < settings.length; i++) {
      if (settings[i].id === id) {
        settings[i].value = value;
        this.setState({ settings: settings });
        return;
      }
    }
  }

  backgroundImgStyle(img) {
    return { backgroundImage: `url(${img})` };
  }

  render() {
    const { loading, error, name, inStock, gallery, description, brand, attributes, bigImg, prices, settings } = this.state;
    const oos = inStock ? "" : "oos";
    if (loading) return <></>;
    if (error) return <>{error}</>;
    return (
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
          <div className="product__dsc--brand">
            <div>{brand}</div>
          </div>
          <div className="product__dsc--name">
            <div>{name}</div>
          </div>
          <div className="product__dsc--attributes">
            {attributes.map((a, index) => {
              return (
                <div className="product__dsc--attributes-type" key={a.id}>
                  <div className="">{a.id}:</div>

                  {a.type === "swatch" && (
                    <div className="swatch__container">
                      {a.items.map((item) => {
                        const borderClass = item.value === settings[index].value ? "swatch__item--border-selected" : "";
                        const itemStyle = { backgroundColor: item.value };
                        const coloredBorder = { border: `1px solid ${item.value}` };
                        return (
                          <div
                            key={`swatch ${item.id}`}
                            className={`swatch__item--border ${borderClass}`}
                            onClick={() => this.changeSettings(a.id, item.value)}
                          >
                            <div className="swatch__item--spacer">
                              {item.displayValue === "White" && (
                                <div className={`swatch__item--white`}>
                                  <div className="swatch__item" style={itemStyle} />
                                </div>
                              )}
                              {item.displayValue !== "White" && (
                                <div style={coloredBorder}>
                                  <div className="swatch__item" style={itemStyle} />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {a.type === "text" && (
                    <div className="text__container">
                      {a.items.map((item) => {
                        const borderClass = item.value === settings[index].value ? "selected" : "";
                        return (
                          <div key={`text ${item.id}`} className={`text__item ${borderClass}`} onClick={() => this.changeSettings(a.id, item.value)}>
                            <div className="text__item--text">{item.value}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="product__dsc--price">
            <div className="product__dsc--attributes-type">Price:</div>
            <div>
              {prices[0].currency.symbol}
              {prices[0].amount}
            </div>
          </div>
          <button className={`product__dsc--button ${oos}`} disabled={!inStock}>
            <div className="product__dsc--button-text">{inStock ? "add to cart" : "out of stock"}</div>
          </button>
          <div className="product__dsc--dsc">
            <div dangerouslySetInnerHTML={{ __html: description }}></div>
          </div>
        </div>
      </div>
    );
  }
}

export default Product;
