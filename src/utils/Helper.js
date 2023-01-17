class Helper {
  static getStyle(className, desiredHref) {
    const styleSheets = document.styleSheets;
    for (const sheet of styleSheets) {
      if (sheet.href !== desiredHref) continue;

      for (const rule of sheet.cssRules) {
        if (rule.selectorText === className) return rule.style;
      }
    }
    return undefined;
  }

  static removeReference = (object) => {
    return JSON.parse(JSON.stringify(object));
  };

  static addToCart(context, productToAdd, settingsRef) {
    if (typeof settingsRef === "undefined") {
      const settings = [];
      productToAdd.attributes.forEach((att) => {
        const id = att.id;
        const value = att.items[0].value;
        settings.push({ id, value });
      });
      settingsRef = settings;
    }

    const [state, setState] = context;

    const cart = this.removeReference(state.cart);
    const { id, brand, name, prices, attributes, gallery } = this.removeReference(productToAdd);
    const settings = this.removeReference(settingsRef);

    for (const product of cart) {
      if (id !== product.id) continue;
      if (JSON.stringify(settings) !== JSON.stringify(product.settings)) continue;

      product.quantity += 1;
      setState({ cart });
      return;
    }

    const addedProduct = { id, brand, name, prices, attributes, gallery, settings, quantity: 1 };
    const newCart = [...cart, addedProduct];
    setState({ cart: newCart });
  }

  static reduceFromCart(context, productToReduce, settingsRef) {
    const [state, setState] = context;
    const cart = this.removeReference(state.cart);

    const { id /* brand, name, prices, attributes, gallery  */ } = productToReduce;
    const settings = settingsRef;

    for (const product of cart) {
      if (id !== product.id) continue;
      let sameSettings = true;

      for (let j = 0; j < settings.length; j++) {
        if (JSON.stringify(settings[j]) === JSON.stringify(product.settings[j])) continue;

        sameSettings = false;
        break;
      }

      if (!sameSettings) continue;

      if (product.quantity > 1) {
        product.quantity -= 1;
        setState({ cart });
        return;
      }

      const adjustedCart = cart.filter((cartProduct) => cartProduct !== product);
      setState({ cart: adjustedCart });
      return;
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
    for (const price of prices) {
      if (currency === "") break;
      if (price.currency.symbol !== currency) continue;

      return `${price.currency.symbol} ${price.amount}`;
    }
    return `${prices[0].currency.symbol} ${prices[0].amount}`;
  }

  static currentPriceWithoutSpaces(prices, currency) {
    const price = this.currentPrice(prices, currency);
    let noSpaces = price.split(" ");
    noSpaces[1] = Number(noSpaces[1]).toFixed(2);

    const spacelessPrice = noSpaces.join("");

    return spacelessPrice;
  }

  static cartQuantity(context) {
    const { cart } = context[0];
    let quantity = 0;

    for (const product of cart) {
      quantity += product.quantity;
    }
    return quantity;
  }

  static cartSum(context) {
    const { cart, currency } = context[0];
    if (cart.length < 1) return 0;
    let sum = 0;

    for (const product of cart) {
      const price = this.currentPrice(product.prices, currency).split(" ")[1];
      sum += product.quantity * Number(price);
    }
    return `${currency}${parseFloat(sum).toFixed(2)}`;
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

  static loadCurrencyFromStorage(setContext, currencies) {
    const json = localStorage.getItem("currency");
    if (!json) {
      setContext({ currency: currencies[0].symbol });
      return;
    }

    const currencyFromStorage = JSON.parse(json);

    for (const currency of currencies) {
      const { symbol } = currency;
      if (currencyFromStorage !== symbol) continue;

      setContext({ currency: currencyFromStorage });
      return;
    }
    setContext({ currency: currencies[0].symbol });
  }

  static saveCartToStorage(cart) {
    const result = [];

    for (const product of cart) {
      const { id, brand, name, prices, attributes, gallery, settings, quantity } = product;

      result.push({ id, brand, name, prices, attributes, gallery, settings, quantity });
    }
    localStorage.setItem("cart", JSON.stringify(result));
  }

  static loadCartFromStorage(setContext) {
    const json = localStorage.getItem("cart");
    if (!json) {
      setContext({ cart: [] });
      return [];
    }
    try {
      const cart = JSON.parse(json);
      const verifiedCart = this.verifyCartItemProperties(cart);

      return verifiedCart;
    } catch (error) {
      localStorage.removeItem("cart");
      localStorage.setItem("cart", "");
      return [];
    }
  }

  static verifyCartItemProperties(cart) {
    const verifiedCart = [];
    for (const cartItem of cart) {
      const { id, brand, name, prices, attributes, gallery, settings, quantity } = cartItem;
      if (!id) continue;
      if (!brand) continue;
      if (!name) continue;
      if (attributes) {
        if (!settings) continue;
        if (attributes?.length !== settings?.length) continue;
      }
      if (!gallery) continue;
      if (!prices) continue;
      if (!quantity || !(quantity > 0)) continue;

      verifiedCart.push(cartItem);
    }

    return verifiedCart;
  }

  static addToCartFromStorage(context, verifiedCart) {
    const [, setState] = context;
    const newCart = [];

    for (const cartItem of verifiedCart) {
      const { id, brand, name, prices, attributes, gallery, settings, quantity } = cartItem;

      let addNewProduct = true;

      for (const newItem of newCart) {
        if (id !== newItem.id) continue;
        if (JSON.stringify(settings) === JSON.stringify(newItem.settings)) addNewProduct = false;
        if (addNewProduct) continue;

        newItem.quantity += quantity;
        break;
      }
      if (!addNewProduct) continue;

      const addedProduct = { id, brand, name, prices, attributes, gallery, settings, quantity };
      newCart.push(addedProduct);
    }
    setState({ cart: newCart });
  }
}

export default Helper;
