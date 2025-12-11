const BaseSteps = require('./BaseSteps');
const LocatorResolver = require('../utils/LocatorResolver');
const { expect } = require('@playwright/test');
class WebSteps extends BaseSteps {
    constructor(page){
        super(page); // page = playwright page
        this.page = page;
    }
    
    async resolveLocator(locatorItem){
        if (!locatorItem) throw new Error('resolveLocator requires a locatorItem');
        return await LocatorResolver.buildLocatorChain(this.page, locatorItem);
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
         await expect(locator).toBeEnabled({ timeout });
    }
    async waitForNotEnabled(locator, timeout = 5000){
         await expect(locator).toBeDisabled({ timeout });
    }
    async waitForChecked(locator, timeout = 5000){
        await expect(locator).toBeChecked({ timeout });
    }
    async waitForNotChecked(locator, timeout = 5000){
        await expect(locator).not.toBeChecked({ timeout });
    }
    async waitForNotHidden(locator, timeout = 5000){
         await expect(locator).toBeVisible({ timeout });
    }
    async waitForHidden(locator, timeout = 5000){
        await expect(locator).toBeHidden({ timeout });
    }
    async waitForVisible(locator, timeout = 5000){
         await expect(locator).toBeVisible({ timeout });
    }
    async waitForNotVisible(locator, timeout = 5000){
         await expect(locator).toBeHidden({ timeout });
    }
    async waitForEditable(locator, timeout = 5000){
        await expect(locator).toBeEditable({ timeout });
    }
    async waitForNotEditable(locator, timeout = 5000){
        await expect(locator).not.toBeEditable({ timeout });
    }
    async waitForDisabled(locator, timeout = 5000){
        await expect(locator).toBeDisabled({ timeout });
    }
    async waitForNotDisabled(locator, timeout = 5000){
        await expect(locator).not.toBeDisabled({ timeout });
    }
    async scrollToElement(locator){
        await locator.scrollIntoViewIfNeeded();
    }
}   
module.exports = WebSteps;