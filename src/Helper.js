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
      if (id === cart[i].id) {
        let sameSettings = true;
        for (let j = 0; j < settings.length; j++) {
          if (JSON.stringify(settings[j]) !== JSON.stringify(cart[i].settings[j])) {
            sameSettings = false;
          }
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
    const { cart } = state;

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

  static currentPrice(prices, currency) {
    let found = false;
    for (let i = 0; i < prices.length && !found; i++) {
      if (prices[i]?.currency?.symbol === currency) {
        found = true;
        return `${prices[i].currency.symbol} ${prices[i]?.amount}`;
      }
    }
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

  static loadCurrencyFromMemory(context) {}
  static loadCartFromMemory(context) {}
}

export default Helper;
