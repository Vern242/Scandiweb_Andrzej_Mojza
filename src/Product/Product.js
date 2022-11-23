import React from "react";
import { client, Field, Query } from "@tilework/opus";

//dodac abortSignaller na unmount -- anuluj przed przejsciem do innej kategori
//wyczyscic kod
//podswietlic kategorie odpowiednia dla produktu.. wziac regule z headera i zmienic?

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
    };
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
        });
        this.activateCategoryBorder(p.category);
      })
      .catch((err) => {
        this.setState({ error: err.message });
      });
  }

  //change gallery imgs to background -- same with bigImg and add links to gallery
  //fix swatches/ attributes and add rest
  render() {
    const { loading, error, name, inStock, gallery, description, category, brand, attributes, bigImg, prices } = this.state;
    if (loading) return <></>;
    if (error) return <>{error}</>;
    return (
      <div className="product__container">
        <div className="product__gallery">
          {gallery.map((img, index) => {
            return <img key={`img${index}`} className="product__gallery--item" src={img} alt={`${brand} ${name} ${index}`} />;
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
            {attributes.map((a) => {
              return (
                <div key={a.id}>
                  <div className="">{a.id}:</div>
                  <div className="swatch__container">
                    {a.type === "swatch" &&
                      a.items.map((item) => {
                        const itemStyle = { backgroundColor: item.value };
                        return (
                          <div className="swatch__item--border" key={`swatch ${item.id}`}>
                            {item.displayValue === "White" && (
                              <div className="swatch__item--white">
                                <div className="swatch__item" style={itemStyle} />
                              </div>
                            )}
                            {item.displayValue !== "White" && (
                              <div className="swatch__item--spacer">
                                <div className="swatch__item" style={itemStyle} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="product__dsc--price">
            <div>
              {prices[0].currency.symbol}
              {prices[0].amount}
            </div>
          </div>
          <div className="product__dsc--button"></div>
          <div className="product__dsc--dsc">
            <div dangerouslySetInnerHTML={{ __html: description }}></div>
          </div>
        </div>
      </div>
    );
  }
}

export default Product;
