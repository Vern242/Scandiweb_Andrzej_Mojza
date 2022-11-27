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

  static addToCart(context, product) {
    const [state, setState] = context;
    const { cart } = state;
    const { brand, name, prices, attributes, settings } = product;
    //check quantity if same settings/ product
  }

  static currentPrice(prices, currency) {
    let found = false;
    for (let i = 0; i < prices.length && !found; i++) {
      if (prices[i].currency.symbol === currency) {
        found = true;
        return `${prices[i].currency.symbol} ${prices[i].amount}`;
      }
    }
  }
}

export default Helper;
