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
}
module.exports = MobileSteps;