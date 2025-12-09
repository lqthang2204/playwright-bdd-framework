const BaseSteps = require('./BaseSteps');
const LocatorResolver = require('../utils/LocatorResolver');
const { expect } = require('@playwright/test');
class WebSteps extends BaseSteps {
    constructor(page){
        super(page); //page = playwright page{
}
    async resolveLocator(locatorItem){
        return await LocatorResolver.buildLocatorChain(this.driver, locatorItem);
}
    async click(locator){
        await locator.click()
    }
    async fill(locator, value){
        await locator.fill(value);
    }
    async type(locator, value){
        await locator.waitFor({ state: 'visible', timeout: 5000 });
        await locator.type(value);
    }
    async clear(locator){
        await locator.clearValue();
    } 
    async getText(locator){
        return await locator.textContent();
    }
    async waitForEnabled(locator, timeout = 5000){
        return await expect(locator).toBeEnabled({ timeout });
    }
    async waitForNotEnabled(locator, timeout = 5000){
        return await expect(locator).toBeDisabled({ timeout });
    }
}   
module.exports = WebSteps;