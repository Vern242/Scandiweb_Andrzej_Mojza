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
}

export default Helper;
