const {expect} = require('@playwright/test');

class BaseSteps{
    constructor(driver){
        this.driver = driver;
    }
    log (action, locator){
        const timestamp  = new Date().toString();
        console.log(`[${timestamp}] Action: ${action}, on Locator: ${JSON.stringify(locator)}`);
    }
    async execute(action, locator, value = null){
        const upper = action.toUpperCase();
        try{
            this.log(action, locator);
            switch(upper){
            case "CLICK":
                return await this.click(locator);
            case "FILL":
                return await this.fill(locator, value);
            case "TYPE":
                return await this.type(locator, value);
            case "CLEAR":
                return await this.clear(locator);
            case "GET TEXT":
                return await this.getText(locator);
            default:
                throw new Error(`Unsupported action: ${action}`);
        }
        }catch(err){
            console.error(`Error executing action ${action} on locator ${JSON.stringify(locator)}: ${err}`);
            throw err;  
        }
        
    }

    // Bse class defines interface that child classed must be ovverride
    async click(locator){throw new Error ("click() not implemented");}
    async fill(locator, value){throw new Error ("fill() not implemented");}
    async type(locator, value){throw new Error ("type() not implemented");}
    async clear(locator){throw new Error ("clear() not implemented");}
    async getText(locator){throw new Error ("getText() not implemented");}  
}
module.exports = BaseSteps;