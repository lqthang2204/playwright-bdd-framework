class LocatorResolver {

  static async buildLocatorChain(pageOrLocator, locatorObj){
    locatorObj = locatorObj.locator
    if(!locatorObj || !Array.isArray(locatorObj.chain) || locatorObj.chain.length ===0){
      throw new Error("Locator object is empty or invalid");
    }
    let locator = null;
    for(const locatorItem of locatorObj.chain){
      // if locator  is the first in the chain => page
      if(!locator){
        locator = await this.resolveLocatorWeb(pageOrLocator, locatorItem);
      }else{
        locator = await this.resolveLocatorWeb(locator, locatorItem);
      }
      //support filters
      if(locatorItem.filter?.hasText){
        locator = locator.filter({hasText: locatorItem.filter.hasText})
      }
      if(locatorItem.filter?.has){
         const hasLocator = page.locator(locatorItem.filter.has.selector);
          locator = locator.filter({ has: hasLocator });
      }
    }
    return locator;
  }
static async resolveLocatorWeb(target, locatorItem) {
    const locatorType = locatorItem.type.toUpperCase();
    switch (locatorType) {
      case "LOCATOR":
        if (!locatorItem.value) throw new Error(`LOCATOR requires "value" property ${JSON.stringify(locatorItem, null, 2)}`);
        return target.locator(locatorItem.value, locatorItem.options || {});
      case "GETBYROLE":
        if (!locatorItem.role) throw new Error(`GETBYROLE requires "role" property ${JSON.stringify(locatorItem, null, 2)}`);
        const options = { ...(locatorItem.name && { name: locatorItem.name }) };
        return target.getByRole(locatorItem.role, options);
      case "GETBYLABEL":
        if (!locatorItem.value) throw new Error(`GETBYLABEL requires "value" property ${JSON.stringify(locatorItem, null, 2)}`);
        return target.getByLabel(locatorItem.value);
      case "GETBYPLACEHOLDER":
        if (!locatorItem.placeholder) throw new Error(`GETBYPLACEHOLDER requires "placeholder" property ${JSON.stringify(locatorItem, null, 2)}`);
        return target.getByPlaceholder(locatorItem.placeholder);
      case "GETBYTEXT":
        if (!locatorItem.value) throw new Error(`GETBYTEXT requires "value" property ${JSON.stringify(locatorItem, null, 2)}`);
        return target.getByText(locatorItem.value, { exact: true });
      case "GETBYALTTEXT":
        if (!locatorItem.text) throw new Error(`GETBYALTTEXT requires "text" property ${JSON.stringify(locatorItem, null, 2)}`);
        return target.getByAltText(locatorItem.text);
      case "FIRST":
        return target.first();
      case "LAST":
        return target.last();
      case "NTH":
        if (
          locatorItem.index === undefined ||
          locatorItem.index < 0 ||
          typeof locatorItem.index !== "number"
        ) {
          throw new Error(`Invalid index for NTH locator: ${locatorItem.index}`);
        }
        return target.nth(locatorItem.index);
      default:
        throw new Error(`Unsupported locator type: ${locatorItem.type}`);
    }
  }
  static async resolveLocatorMobile(driver, locatorItem){
    const el = locatorItem.locator || locatorItem
    const type = el.type?.toUpperCase?.();
    if(!type){
      throw new Error(`Missing locator type in ${JSON.stringify(el)}`);
    }
    switch(type){
      case "ID":               return driver.$(`id=${el.value}`);
      case "ACCESSIBILITY_ID": return driver.$(`~${el.value}`);
      case "XPATH":            return driver.$(el.value);
      case "CLASS_NAME":       return driver.$(`class=${el.value}`);
      case "NAME":             return driver.$(`name=${el.value}`);
      case "CSS":              return driver.$(el.value);
      case "PREDICATE":        return driver.$(`-ios predicate string:${el.value}`);
      case "CLASS_CHAIN":      return driver.$(`-ios class chain:${el.value}`);
      case "UIAUTOMATOR":      return driver.$(`android=${el.value}`);
      default:
        throw new Error(`Unsupported mobile locator type: ${type}`);
    }
  }
}
module.exports = LocatorResolver;
