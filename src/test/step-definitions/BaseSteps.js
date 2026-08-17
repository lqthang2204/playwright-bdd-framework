const { expect } = require("@playwright/test");
const chalk = require("chalk");
const self_healing = require("../../../libs/self-healingAI.js");
const general = require("../../../libs/general.js");
const pageFixture = require("../../../support/pageFixture.js");
const manageYamlFile = require("../../../libs/ManageYamlFile.js");
const ManageMode = require("../utils/ManageMode.js");

class BaseSteps {
    constructor(driver) {
        this.driver = driver;
    }
    log(action, locator) {
        const timestamp = new Date().toString();
        console.log(
            chalk.blue(
                `[${timestamp}] Action: ${action}, on Locator: ${JSON.stringify(locator)}`,
            ),
        );
    }
    async execute(
        action,
        locator,
        value = null,
        elementId = null,
        dataYaml = null,
        fileName = null,
        locatorItem = null,
    ) {
        const upper = action.toUpperCase();
        try {
            this.log(action, locator);
            let result;
            switch (upper) {
                case "CLICK":
                    result = await this.click(locator);
                    break;
                case "FILL":
                    result = await this.fill(locator, value);
                    break;
                case "TYPE":
                    result = await this.type(locator, value);
                    break;
                case "CLEAR":
                    result = await this.clear(locator);
                    break;
                case "GET TEXT":
                    result = await this.getText(locator);
                    break;
                case "VERIFY TITLE":
                    result = await this.verifyTitle(value, expectedTitle);
                    break;
                case "SCROLL":
                    result = await this.scrollToElement(locator);
                    break;
                default:
                    throw new Error(`Unsupported action: ${action}`);
            }
            const cfg = pageFixture.getConfig ? pageFixture.getConfig() : null;
            if (cfg && cfg.highlight_element) {
                // highlight the element and screen shot and store the file in cache folder
                await general.highlightElement(locator);

                // const screenshotPath = await steps.takeScreenshot(elementId);
                // console.log(chalk.green(`Screenshot saved at: ${screenshotPath}`));
            }
            return result;
        } catch (err) {
            console.error(
                chalk.red(
                    `Error executing action ${action} on locator ${JSON.stringify(locator)}: ${err}`,
                ),
            );
            // Attempt self-healing on timeout / not found
            if (
                (err.name === "TimeoutError" ||
                    (err.message &&
                        (err.message.includes("not found") ||
                            err.message.includes("No node found") ||
                            err.message.includes("Timed out")))) &&
                self_healing.isSelfHealingAvailable()
            ) {
                try {
                    console.log(
                        chalk.yellow(
                            `Attempting self-healing for action ${action} on locator ${JSON.stringify(locator)}...`,
                        ),
                    );
                    const runtimePage = this.page || this.driver || null;
                    const newLocator = await self_healing.generateLocatorFromAI(
                        err.message,
                        runtimePage,
                        locator,
                        elementId,
                    );
                    console.log(
                        chalk.green(
                            `Self-healing produced locator: ${JSON.stringify(newLocator)}`,
                        ),
                    );
                    const resolved = await this.resolveLocator(newLocator);
                    // retry the same action with healed locator
                    let healedResult;
                    switch (upper) {
                        case "CLICK":
                            healedResult = await this.click(resolved);
                            break;
                        case "FILL":
                            healedResult = await this.fill(resolved, value);
                            break;
                        case "TYPE":
                            healedResult = await this.type(resolved, value);
                            break;
                        case "CLEAR":
                            healedResult = await this.clear(resolved);
                            break;
                        case "GET TEXT":
                            healedResult = await this.getText(resolved);
                            break;
                        case "VERIFY TITLE":
                            healedResult = await this.verifyTitle(value, expectedTitle);
                            break;
                        case "SCROLL":
                            healedResult = await this.scrollToElement(resolved);
                            break;
                        default:
                            throw err;
                    }
                    if(healedResult){
                        this.updateHealedLocator(locatorItem, dataYaml, elementId, newLocator);
                    }
                    
                    return healedResult;
                } catch (healErr) {
                    console.error(
                        chalk.red(
                            `Self-healing failed during execute(): ${healErr.message}`,
                        ),
                    );
                    throw err; // throw original
                }
            }
            throw err;
        }
    }
    async waitForStatus(
        locator,
        status,
        timeout = 5000,
        pollInterval = 500,
        retry = 1,
        elementId = null,
        dataYaml = null,
        fileName = null,
        locatorItem = null,
    ) {
        try {
            let result;
            switch (status.toUpperCase()) {
                case "ENABLED":
                    result = await this.waitForEnabled(locator, timeout, pollInterval);
                    break;
                case "NOT_ENABLED":
                    result = await this.waitForNotEnabled(locator, timeout, pollInterval);
                    break;
                case "VISIBLE":
                    result = await this.waitForVisible(locator, timeout, pollInterval);
                    break;
                case "NOT_VISIBLE":
                    result = await this.waitForNotVisible(locator, timeout, pollInterval);
                    break;
                case "EDITABLE":
                    result = await this.waitForEditable(locator, timeout, pollInterval);
                    break;
                case "NOT_EDITABLE":
                    result = await this.waitForNotEditable(
                        locator,
                        timeout,
                        pollInterval,
                    );
                    break;
                case "CHECKED":
                    result = await this.waitForChecked(locator, timeout, pollInterval);
                    break;
                case "NOT_CHECKED":
                    result = await this.waitForNotChecked(locator, timeout, pollInterval);
                    break;
                case "DISABLED":
                    result = await this.waitForDisabled(locator, timeout, pollInterval);
                    break;
                case "NOT_DISABLED":
                    result = await this.waitForNotDisabled(
                        locator,
                        timeout,
                        pollInterval,
                    );
                    break;
                case "HIDDEN":
                    result = await this.waitForHidden(locator, timeout, pollInterval);
                    break;
                case "NOT_HIDDEN":
                    result = await this.waitForNotHidden(locator, timeout, pollInterval);
                    break;
                default:
                    throw new Error(`Unsupported status: ${status}`);
            }

            // wait for status successful
            // if there is cached_locator is true then store highlight and locator into cache
            const cfg = pageFixture.getConfig ? pageFixture.getConfig() : null;
            if (cfg && cfg.highlight_element) {
                // highlight the element and screen shot and store the file in cache folder
                await general.highlightElement(locator);

                // const screenshotPath = await steps.takeScreenshot(elementId);
                // console.log(chalk.green(`Screenshot saved at: ${screenshotPath}`));
            }
            return true;
        } catch (error) {
            console.error(
                chalk.red(
                    `Error waiting for status ${status} on locator ${JSON.stringify(locator)}: ${error.message}`,
                ),
            );
            console.error(chalk.gray(error.stack));

            // Detect timeout or element not found
            if (
                (error.message.includes("Timed out") ||
                    error.message.includes("not found") ||
                    error.message.includes("No node found")) &&
                retry > 0 &&
                self_healing.isSelfHealingAvailable()
            ) {
                console.log(
                    chalk.yellow(
                        `Attempting self-healing for locator ${JSON.stringify(locator)}...`,
                    ),
                );

                try {
                    const runtimePage = this.page || this.driver || null;
                    const newLocator = await self_healing.generateLocatorFromAI(
                        error.message,
                        runtimePage,
                        locator,
                        elementId,
                    );
                    const resolved = await this.resolveLocator(newLocator);
                    // Retry with new locator (decrease retry count)
                    const result = await this.waitForStatus(
                        resolved,
                        status,
                        timeout,
                        pollInterval,
                        retry - 1,
                        elementId,
                        dataYaml,
                        fileName,
                        locatorItem,
                    );
                    if (result === true) {
                        this.updateHealedLocator(locatorItem, dataYaml, elementId, newLocator);
                    }
                    return result;
                } catch (healError) {
                    console.error(chalk.red(`Self-healing failed: ${healError.message}`));
                    throw error;
                }
            }

            throw error; // rethrow if not healable
        }
    }

    /**
     * Updates the healed locator into locatorItem in-memory.
     * Since locatorItem.locator references the exact object inside dataYaml.elements,
     * mutating locatorItem updates dataYaml automatically.
     * @param {Object} locatorItem 
     * @param {Object} dataYaml 
     * @param {string} elementId 
     * @param {Object} newLocator 
     */
    updateHealedLocator(locatorItem, dataYaml, elementId, newLocator) {
        if (!newLocator) return;
        const newChain = newLocator.chain
            ? newLocator.chain
            : (newLocator.locator?.chain ? newLocator.locator.chain : [newLocator]);

        // Cập nhật trực tiếp qua locatorItem (tự động cập nhật dataYaml nhờ Reference)
        const executionContext = ManageMode.getExecutionContext
            ? ManageMode.getExecutionContext()
            : { device: "DESKTOP" };
        const device = executionContext.device || "DESKTOP";
        const element = dataYaml.elements.find((el) => el.id === elementId);
        if (element) {
            if (!element.locators) element.locators = [];
            const locObj = element.locators.find((l) => l.device === device);
            if (locObj) {
                locObj.chain = newChain;
            } else {
                element.locators.push({ device, chain: newChain });
            }
        }


        const targetId = elementId || locatorItem?.id || "element";
        console.log(
            chalk.green(
                `✅ Self-healed locator updated for element "${targetId}".`,
            ),
        );
    }

    // Subclasses should implement `resolveLocator(locatorItem)`

    // Bse class defines interface that child classed must be ovverride
    async resolveLocator(locatorItem) {
        throw new Error("resolveLocator() not implemented");
    }
    async click(locator) {
        throw new Error("click() not implemented");
    }
    async fill(locator, value) {
        throw new Error("fill() not implemented");
    }
    async type(locator, value) {
        throw new Error("type() not implemented");
    }
    async clear(locator) {
        throw new Error("clear() not implemented");
    }
    async getText(locator) {
        throw new Error("getText() not implemented");
    }
    async scrollToElement(locator) {
        throw new Error("scrollToElement() not implemented");
    }
    async verifyTitle(expectedTitle) {
        throw new Error("verifyTitle() not implemented");
    }
    async waitForEnabled(locator, timeout, pollInterval) {
        throw new Error("waitForEnabled() not implemented");
    }
    async waitForNotEnabled(locator, timeout, pollInterval) {
        throw new Error("waitForNotEnabled() not implemented");
    }
    async waitForVisible(locator, timeout, pollInterval) {
        throw new Error("waitForVisible() not implemented");
    }
    async waitForNotVisible(locator, timeout, pollInterval) {
        throw new Error("waitForNotVisible() not implemented");
    }
    async waitForEditable(locator, timeout, pollInterval) {
        throw new Error("waitForEditable() not implemented");
    }
    async waitForNotEditable(locator, timeout, pollInterval) {
        throw new Error("waitForNotEditable() not implemented");
    }
    async waitForChecked(locator, timeout, pollInterval) {
        throw new Error("waitForChecked() not implemented");
    }
    async waitForNotChecked(locator, timeout, pollInterval) {
        throw new Error("waitForNotChecked() not implemented");
    }
    async waitForDisabled(locator, timeout, pollInterval) {
        throw new Error("waitForDisabled() not implemented");
    }
    async waitForNotDisabled(locator, timeout, pollInterval) {
        throw new Error("waitForNotDisabled() not implemented");
    }
    async waitForDisplayed(locator, timeout, pollInterval) {
        throw new Error("waitForDisplayed() not implemented");
    }
    async waitForNotDisplayed(locator, timeout, pollInterval) {
        throw new Error("waitForNotDisplayed() not implemented");
    }
    async waitForHidden(locator, timeout, pollInterval) {
        throw new Error("waitForHidden() not implemented");
    }
    async waitForNotHidden(locator, timeout, pollInterval) {
        throw new Error("waitForNotHidden() not implemented");
    }
}
module.exports = BaseSteps;
