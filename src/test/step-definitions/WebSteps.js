const BaseSteps = require('./BaseSteps');
const LocatorResolver = require('../utils/LocatorResolver');
const { expect } = require('@playwright/test');

const DEFAUTL_TIMEOUT = 20000;
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
        await this.waitForVisible(locator)
        await locator.click()
    }
    async fill(locator, value){
        await this.waitForVisible(locator);
        await locator.fill(value);
    }
    async type(locator, value){
        await this.waitForVisible(locator);
        await locator.type(value);
    }
    async clear(locator){
        await this.waitForVisible(locator);
        await locator.clearValue();
    } 
    async getText(locator){
        await this.waitForVisible(locator);
        return await locator.textContent();
    }
    async waitForEnabled(locator, timeout = DEFAUTL_TIMEOUT){
         await expect(locator).toBeEnabled({ timeout });
    }
    async waitForNotEnabled(locator, timeout = DEFAUTL_TIMEOUT){
         await expect(locator).toBeDisabled({ timeout });
    }
    async waitForChecked(locator, timeout = DEFAUTL_TIMEOUT){
        await expect(locator).toBeChecked({ timeout });
    }
    async waitForNotChecked(locator, timeout = DEFAUTL_TIMEOUT){
        await expect(locator).not.toBeChecked({ timeout });
    }
    async waitForNotHidden(locator, timeout = DEFAUTL_TIMEOUT){
         await expect(locator).toBeVisible({ timeout });
    }
    async waitForHidden(locator, timeout = DEFAUTL_TIMEOUT){
        await expect(locator).toBeHidden({ timeout });
    }
    async waitForVisible(locator, timeout = DEFAUTL_TIMEOUT){
         await expect(locator).toBeVisible({ timeout });
    }
    async waitForNotVisible(locator, timeout = DEFAUTL_TIMEOUT){
         await expect(locator).toBeHidden({ timeout });
    }
    async waitForEditable(locator, timeout = DEFAUTL_TIMEOUT){
        await expect(locator).toBeEditable({ timeout });
    }
    async waitForNotEditable(locator, timeout = DEFAUTL_TIMEOUT){
        await expect(locator).not.toBeEditable({ timeout });
    }
    async waitForDisabled(locator, timeout = DEFAUTL_TIMEOUT){
        await expect(locator).toBeDisabled({ timeout });
    }
    async waitForNotDisabled(locator, timeout = DEFAUTL_TIMEOUT){
        await expect(locator).not.toBeDisabled({ timeout });
    }
    async scrollToElement(locator){
        await locator.scrollIntoViewIfNeeded();
    }
    async waitForChecked(locator, timeout = DEFAUTL_TIMEOUT){
        await expect(locator).toBeChecked({ timeout });
        }
    async waitForNotChecked(locator, timeout = DEFAUTL_TIMEOUT){
        await expect(locator).not.toBeChecked({ timeout }); 
    }
}   
module.exports = WebSteps;