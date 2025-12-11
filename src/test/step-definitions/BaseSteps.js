const {expect} = require('@playwright/test');
const chalk = require("chalk");
class BaseSteps{
    constructor(driver){
        this.driver = driver;
    }
    log (action, locator){
        const timestamp  = new Date().toString();
        console.log(chalk.blue(`[${timestamp}] Action: ${action}, on Locator: ${JSON.stringify(locator)}`));
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
            case "VERIFY TITLE":
                return await this.verifyTitle(value, expectedTitle);
            default:
                throw new Error(`Unsupported action: ${action}`);
        }
        }catch(err){
            console.error(chalk.red(`Error executing action ${action} on locator ${JSON.stringify(locator)}: ${err}`));
            throw err;  
        }
        
    }
    async waitForStatus(locator, status, timeout = 5000, pollInterval = 500){
        switch(status.toUpperCase()){
            case "ENABLED":
                return await this.waitForEnabled(locator, timeout, pollInterval);
            case "NOT_ENABLED":
                return await this.waitForNotEnabled(locator, timeout, pollInterval);             
            case "VISIBLE":
                return await this.waitForVisible(locator, timeout, pollInterval);
            case "NOT_VISIBLE":
                return await this.waitForNotVisible(locator, timeout, pollInterval);
            case "EDITABLE":
                return await this.waitForEditable(locator, timeout, pollInterval);   
            case "NOT_EDITABLE":
                return await this.waitForNotEditable(locator, timeout, pollInterval);
            case "CHECKED":
                return await this.waitForChecked(locator, timeout, pollInterval);
            case "NOT_CHECKED":
                return await this.waitForNotChecked(locator, timeout, pollInterval);
            case "DISABLED":
                return await this.waitForDisabled(locator, timeout, pollInterval);
            case "NOT_DISABLED":
                return await this.waitForNotDisabled(locator, timeout, pollInterval);
            case "HIDDEN":
                return await this.waitForHidden(locator, timeout, pollInterval);
            case "NOT_HIDDEN":
                return await this.waitForNotHidden(locator, timeout, pollInterval);
            default:
                throw new Error(`Unsupported status: ${status}`);
        }


    }

    // Bse class defines interface that child classed must be ovverride
    async click(locator){throw new Error ("click() not implemented");}
    async fill(locator, value){throw new Error ("fill() not implemented");}
    async type(locator, value){throw new Error ("type() not implemented");}
    async clear(locator){throw new Error ("clear() not implemented");}
    async getText(locator){throw new Error ("getText() not implemented");}  
    async verifyTitle(expectedTitle){throw new Error ("verifyTitle() not implemented");}
    async waitForEnabled(locator, timeout, pollInterval){throw new Error ("waitForEnabled() not implemented");}
    async waitForNotEnabled(locator, timeout, pollInterval){throw new Error ("waitForNotEnabled() not implemented");}  
    async waitForVisible(locator,timeout, pollInterval){throw new Error ("waitForVisible() not implemented");}
    async waitForNotVisible(locator, timeout, pollInterval){throw new Error ("waitForNotVisible() not implemented");}   
    async waitForEditable(locator, timeout, pollInterval){throw new Error ("waitForEditable() not implemented");}
    async waitForNotEditable(locator, timeout, pollInterval){throw new Error ("waitForNotEditable() not implemented");}   
    async waitForChecked(locator,timeout, pollInterval){throw new Error ("waitForChecked() not implemented");}
    async waitForNotChecked(locator, timeout, pollInterval){throw new Error ("waitForNotChecked() not implemented");}
    async waitForDisabled(locator, timeout, pollInterval){throw new Error ("waitForDisabled() not implemented");}
    async waitForNotDisabled(locator, timeout, pollInterval){throw new Error ("waitForNotDisabled() not implemented");}
    async waitForDisplayed(locator, timeout, pollInterval){throw new Error ("waitForDisplayed() not implemented");}
    async waitForNotDisplayed(locator, timeout, pollInterval){throw new Error ("waitForNotDisplayed() not implemented");}
    async waitForHidden(locator, timeout, pollInterval){throw new Error ("waitForHidden() not implemented");}
    async waitForNotHidden(locator, timeout, pollInterval){throw new Error ("waitForNotHidden() not implemented");}

}
module.exports = BaseSteps;