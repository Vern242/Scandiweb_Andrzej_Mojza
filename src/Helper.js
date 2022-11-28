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

  static addToCart(context, product, settingsRef) {
    const removeReference = (object) => {
      return JSON.parse(JSON.stringify(object));
    };
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
    const { cart } = removeReference(state);

    const { id, brand, name, prices, attributes, gallery } = removeReference(product);
    const settings = removeReference(settingsRef);

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

  static currentPrice(prices, currency) {
    let found = false;
    for (let i = 0; i < prices.length && !found; i++) {
      if (prices[i]?.currency?.symbol === currency) {
        found = true;
        return `${prices[i].currency.symbol} ${prices[i]?.amount}`;
      }
    }
  }
}

export default Helper;
