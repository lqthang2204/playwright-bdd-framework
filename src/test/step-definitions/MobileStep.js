const BaseSteps = require('./BaseSteps');
class MobileSteps extends BaseSteps {
    constructor(driver){
        super(driver); //dtriver = webdriverIO session
    }
    async click(locator){
        await locator.click()
    }
    async fill(locator, value){
        await locator.setValue(value);
    }
    async type(locator, value){
        await locator.type(value);
    }
    async clear(locator){
        await locator.clearValue(); 
    }   
    async getText(locator){
        return await locator.getText();
    }
}
module.exports = MobileSteps;