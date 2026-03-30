const BaseSteps = require('./BaseSteps');
const LocatorResolver = require('../utils/LocatorResolver');
const ManageMode = require("../utils/ManageMode.js");
class MobileSteps extends BaseSteps {
    constructor(driver){
        super(driver); //dtriver = webdriverIO session
    }
    async resolveLocator(locatorItem){
        return await LocatorResolver.resolveLocatorMobile(this.driver, locatorItem);
}
    async click(locator){
        await locator.click()
    }
    async fill(locator, value){
        await locator.setValue(value);
    }
    async type(locator, value){
        // _executionContext = ManageMode.getExecutionContext();
        // if(_executionContext.device.toUpperCase() === "IOS"){
        await locator.clearValue();
        await locator.setValue(value);
        // }else{
        // await locator.sendKeys(value);
        // }
    }
    async clear(locator){
        await locator.clearValue(); 
    }   
    async getText(locator){
        return await locator.getText();
    }
    async waitForEnabled(locator, timeout = 5000, pollInterval = 500){
        return await locator.waitForEnabled({ timeout });

    }
    async waitForNotEnabled(locator, timeout = 5000, pollInterval= 500){
        return await locator.waitForEnabled({ timeout, reverse: true });
    }
    async waitForDisabled(locator, timeout = 5000, pollInterval = 500){
        return await locator.waitForDidplayed({ timeout });
    }
    async waitForNotDisplayed(locator, timeout = 5000, pollInterval = 500){
        return await locator.waitForDisplayed({ timeout, reverse: true });
    }
}
module.exports = MobileSteps;