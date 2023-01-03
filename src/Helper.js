class Helper {
  static getStyle(className, desiredHref) {
    const styleSheets = document.styleSheets;
    for (const sheet of styleSheets) {
      if (sheet.href === desiredHref) {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText === className) return rule.style;
        }
      }
    }
    return undefined;
  }

  static removeReference = (object) => {
    return JSON.parse(JSON.stringify(object));
  };

  static addToCart(context, product, settingsRef) {
    if (typeof settingsRef === "undefined") {
      const settings = [];
      product.attributes.forEach((att) => {
        const id = att.id;
        const value = att.items[0].value;
        settings.push({ id, value });
      });
      settingsRef = settings;
    }

    const [state, setState] = context;

    const cart = this.removeReference(state.cart);
    const { id, brand, name, prices, attributes, gallery } = this.removeReference(product);
    const settings = this.removeReference(settingsRef);

    for (let i = 0; i < cart.length; i++) {
      let sameSettings = true;
      if (id === cart[i].id) {
        if (JSON.stringify(settings) !== JSON.stringify(cart[i].settings)) {
          sameSettings = false;
        }
        if (sameSettings) {
          cart[i].quantity += 1;
          setState({ cart });
          return;
        }
      }
    }

    const addedProduct = { id, brand, name, prices, attributes, gallery, settings, quantity: 1 };
    const newCart = [...cart, addedProduct];
    setState({ cart: newCart });
  }

  static reduceFromCart(context, product, settingsRef) {
    const [state, setState] = context;
    const cart = this.removeReference(state.cart);

    const { id /* brand, name, prices, attributes, gallery  */ } = product;
    const settings = settingsRef;

    for (let i = 0; i < cart.length; i++) {
      if (id === cart[i].id) {
        let sameSettings = true;
        for (let j = 0; j < settings.length; j++) {
          if (JSON.stringify(settings[j]) !== JSON.stringify(cart[i].settings[j])) {
            sameSettings = false;
          }
        }
        if (sameSettings) {
          if (cart[i].quantity > 1) {
            cart[i].quantity -= 1;
            setState({ cart });
            return;
          }
          cart.splice(i, 1);
          setState({ cart });
          return;
        }
      }
    }
  }

  static showCartMessage() {
    const message = document.querySelector(".message__bar");
    if (message.classList.contains("show")) return;

    message.classList.toggle("show");
    setTimeout(() => {
      message.classList.toggle("show");
    }, 1000);
  }

  static currentPrice(prices, currency) {
    let found = false;
    for (let i = 0; i < prices.length && !found; i++) {
      if (prices[i]?.currency?.symbol === currency) {
        found = true;
        return `${prices[i].currency.symbol} ${prices[i]?.amount}`;
      }
    }
  }

  static currentPriceWithoutSpaces(prices, currency) {
    const price = this.currentPrice(prices, currency);
    return price.replace(/\s+/g, "");
  }

  static cartQuantity(context) {
    const { cart } = context[0];
    let quantity = 0;
    for (let i = 0; i < cart.length; i++) {
      quantity += cart[i].quantity;
    }
    return quantity;
  }

  static cartSum(context) {
    const { cart, currency } = context[0];
    let sum = 0;
    if (cart.length > 0) {
      for (let i = 0; i < cart.length; i++) {
        const price = this.currentPrice(cart[i].prices, currency).split(" ")[1];
        sum += cart[i].quantity * Number(price);
      }
      return `${currency}${parseFloat(sum).toFixed(2)}`;
    }
    return 0;
  }

  static updateCurrentCategory(category, context) {
    const [state, setState] = context;
    const { currentCategory } = state;

    if (currentCategory === category) return;
    setState({ currentCategory: category });
  }

  static saveCurrencyToStorage(currency) {
    localStorage.setItem("currency", JSON.stringify(currency));
  }

  static saveCartToStorage(cart) {
    const result = [];
    for (let i = 0; i < cart.length; i++) {
      const { id, settings, quantity } = cart[i];
      result.push({ id, settings, quantity });
    }
    localStorage.setItem("cart", JSON.stringify(result));
  }

  static loadCurrencyFromStorage(setContext, currencies) {
    const json = localStorage.getItem("currency");
    if (!json) {
      setContext({ currency: currencies[0].symbol });
      return;
    }

    const currency = JSON.parse(json);
    for (let i = 0; i < currencies.length; i++) {
      const { symbol } = currencies[i];
      if (currency === symbol) {
        setContext({ currency: currency });
        return;
      }
    }
    setContext({ currency: currencies[0].symbol });
  }

  static loadCartFromStorage(setContext) {
    const json = localStorage.getItem("cart");
    if (!json) {
      setContext({ cart: [] });
      return;
    }
    try {
      const cart = JSON.parse(json);
      for (let i = 0; i < cart.length; i++) {
        if (!cart[i].id) {
          cart.splice(i, 1);
        }
      }
      return cart;
    } catch (error) {
      localStorage.removeItem("cart");
      localStorage.setItem("cart", "");
      return [];
    }
  }

  static verifyCart(storageCart, fetchedProducts) {
    const verifiedCart = [];
    for (let i = 0; i < fetchedProducts.length; i++) {
      const { product } = fetchedProducts[i];
      if (product) {
        const { id, brand, name, prices, attributes, gallery, inStock } = product;
        const { settings } = storageCart[i];
        let { quantity } = storageCart[i];
        const verifiedSettings = [];
        if (inStock) {
          if (typeof quantity !== "number" || quantity < 1 || quantity > 10) quantity = quantity > 10 ? 10 : 1;
          for (let j = 0; j < attributes.length; j++) {
            let settingFound = false;
            if (settings[j].id === attributes[j].id) {
              for (let k = 0; k < attributes[j].items.length && !settingFound; k++) {
                if (settings[j].value === attributes[j].items[k].value) {
                  verifiedSettings.push({ id: settings[j].id, value: settings[j].value });
                  settingFound = true;
                }
              }
            }
            if (!settingFound) verifiedSettings.push({ id: attributes[j].id, value: attributes[j].items[0].value });
          }
          const verifiedProduct = { id, brand, name, prices, attributes, gallery };
          verifiedCart.push({ product: verifiedProduct, settings: verifiedSettings, quantity });
        }
      }
    }
    return verifiedCart;
  }

  static addToCartFromStorage(context, verifiedCart) {
    const [, setState] = context;
    const newCart = [];

    for (let i = 0; i < verifiedCart.length; i++) {
      const { product, settings, quantity } = verifiedCart[i];
      const { id, brand, name, prices, attributes, gallery } = product;

      let addNewProduct = true;
      for (let i = 0; i < newCart.length; i++) {
        if (id === newCart[i].id) {
          if (JSON.stringify(settings) === JSON.stringify(newCart[i].settings)) {
            addNewProduct = false;
          }
          if (!addNewProduct) {
            newCart[i].quantity += quantity;
          }
        }
      }
      if (addNewProduct) {
        const addedProduct = { id, brand, name, prices, attributes, gallery, settings, quantity };
        newCart.push(addedProduct);
      }
    }
    setState({ cart: newCart });
  }
}

export default Helper;
