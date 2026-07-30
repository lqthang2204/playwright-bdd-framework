const {expect} = require('@playwright/test');
const chalk = require("chalk");
const self_healing = require("../../../libs/self-healingAI.js");
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
            case "SCROLL":
                return await this.scrollToElement(locator);
            default:
                throw new Error(`Unsupported action: ${action}`);
        }
        }catch(err){
            console.error(chalk.red(`Error executing action ${action} on locator ${JSON.stringify(locator)}: ${err}`));
            // Attempt self-healing on timeout / not found
            if ((err.name === 'TimeoutError' || (err.message && (err.message.includes('not found') || err.message.includes('No node found'))))) {
                try {
                    console.log(chalk.yellow(`Attempting self-healing for action ${action} on locator ${JSON.stringify(locator)}...`));
                    const runtimePage = this.page || this.driver || null;
                    const newLocator = await self_healing.generateLocatorFromAI(err.message, runtimePage, locator);
                    console.log(chalk.green(`Self-healing produced locator: ${JSON.stringify(newLocator)}`));
                    const resolved = await this.resolveLocator(newLocator);
                    // retry the same action with healed locator
                    switch(upper){
                        case "CLICK":
                            return await this.click(resolved);
                        case "FILL":
                            return await this.fill(resolved, value);
                        case "TYPE":
                            return await this.type(resolved, value);
                        case "CLEAR":
                            return await this.clear(resolved);
                        case "GET TEXT":
                            return await this.getText(resolved);
                        case "VERIFY TITLE":
                            return await this.verifyTitle(value, expectedTitle);
                        case "SCROLL":
                            return await this.scrollToElement(resolved);
                        default:
                            throw err;
                    }
                } catch (healErr) {
                    console.error(chalk.red(`Self-healing failed during execute(): ${healErr.message}`));
                    throw err; // throw original
                }
            }
            throw err;
        }
        
    }
   async waitForStatus(locator, status, timeout = 5000, pollInterval = 500, retry = 1) {
    try {
        switch (status.toUpperCase()) {
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
    } catch (error) {
        console.error(chalk.red(
            `Error waiting for status ${status} on locator ${JSON.stringify(locator)}: ${error.message}`
        ));
        console.error(chalk.gray(error.stack));

        // Detect timeout or element not found
        if ((error.name === 'TimeoutError' || error.message.includes('not found') || error.message.includes('No node found')) && retry > 0) {
            console.log(chalk.yellow(
                `Attempting self-healing for locator ${JSON.stringify(locator)}...`
            ));

            try {
                const runtimePage = this.page || this.driver || null;
                const newLocator = await self_healing.generateLocatorFromAI(
                    error.message,
                    runtimePage,
                    locator
                );

                console.log(chalk.green(
                    `Self-healing successful. Raw AI locator: ${JSON.stringify(newLocator)}`
                ));

                const resolved = await this.resolveLocator(newLocator);
                // Retry with new locator (decrease retry count)
                return await this.waitForStatus(
                    resolved,
                    status,
                    timeout,
                    pollInterval,
                    retry - 1
                );

            } catch (healError) {
                console.error(chalk.red(`Self-healing failed: ${healError.message}`));
                throw error; // original error
            }
        }

        throw error; // rethrow if not healable
    }
}

    // Subclasses should implement `resolveLocator(locatorItem)`

    // Bse class defines interface that child classed must be ovverride
    async click(locator){throw new Error ("click() not implemented");}
    async fill(locator, value){throw new Error ("fill() not implemented");}
    async type(locator, value){throw new Error ("type() not implemented");}
    async clear(locator){throw new Error ("clear() not implemented");}
    async getText(locator){throw new Error ("getText() not implemented");}  
    async scrollToElement(locator){throw new Error ("scrollToElement() not implemented");}
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