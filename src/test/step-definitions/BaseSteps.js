const { expect } = require("@playwright/test");
const chalk = require("chalk");
const self_healing = require("../../../libs/self-healingAI.js");
const general = require("../../../libs/general.js");
const pageFixture = require("../../../support/pageFixture.js");
const manageYamlFile = require("../../../libs/ManageYamlFile.js");
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
    async execute(action, locator, value = null) {
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
                            err.message.includes("No node found")))) &&
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
                    );
                    console.log(
                        chalk.green(
                            `Self-healing produced locator: ${JSON.stringify(newLocator)}`,
                        ),
                    );
                    const resolved = await this.resolveLocator(newLocator);
                    // retry the same action with healed locator
                    switch (upper) {
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
        elementId,
        dataYaml,
        fileName,
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
                    const isFileExist = await general.checkFileExists(
                        fileName,
                        "../Resources/Pages/healingAI/",
                        ".yaml",
                    );
                    if (!isFileExist) {
                        console.log(
                            chalk.yellow(
                                `File ${fileName} does not exist in healingAI folder. Skipping find element in file , ready finding by AI`,
                            ),
                        );
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
                        );
                        // cache the healed locator only when the retry truly succeeded
                        if (result === true) {
                            await general.writeLocatorToFile(
                                elementId,
                                newLocator,
                                "../Resources/Pages/healingAI/",
                                fileName,
                            );
                        } else {
                            console.log(
                                chalk.yellow(
                                    `Retry did not complete successfully. Skipping cache write.`,
                                ),
                            );
                        }
                        return result;
                    } else {
                        try {
                            const cachedLocator = await general.getLocatorFromCache(
                                elementId,
                                fileName,
                                "../Resources/Pages/healingAI/",
                            );
                            if (cachedLocator) {
                                console.log(
                                    chalk.green(
                                        `Found cached locator for ${elementId} in ${fileName}.yaml`,
                                    ),
                                );
                                const resolved = await this.resolveLocator(cachedLocator);
                                // Retry with cached locator (decrease retry count)
                                const result = await this.waitForStatus(
                                    resolved,
                                    status,
                                    timeout,
                                    pollInterval,
                                    retry - 1,
                                    elementId,
                                    dataYaml,
                                    fileName,
                                );
                                if (result === true) {
                                    console.log(
                                        chalk.green(
                                            `Successfully waited for status ${status} on cached locator for ${elementId}.`,
                                        ),
                                    );
                                } else {
                                    console.log(
                                        chalk.yellow(
                                            `Retry with cached locator did not complete successfully.`,
                                        ),
                                    );
                                }
                                return result;
                            } else {
                                console.log(
                                    chalk.yellow(
                                        `No cached locator found for ${elementId} in ${fileName}.yaml. Skipping retry.`,
                                    ),
                                );
                                throw error; // Re-throw original error
                            }
                        } catch (cacheError) {
                            console.error(
                                chalk.red(
                                    `Error retrieving cached locator for ${elementId} from ${fileName}.yaml: ${cacheError.message}`,
                                ),
                            );
                            throw error; // Re-throw original error
                        }
                    }
                } catch (healError) {
                    console.error(chalk.red(`Self-healing failed: ${healError.message}`));
                    throw error;
                }
            }

            throw error; // rethrow if not healable
        }
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
