const pageFixture = require("../../../support/pageFixture.js");
const { chromium, firefox, webkit } = require("playwright");
const { remote } = require("webdriverio");
const path = require("path");
const fs = require("fs");
const { expect } = require("@playwright/test");
const manageYamlFile = require("../../../libs/ManageYamlFile.js");
const { type } = require("os");

class ManageStepsDefinitions {
  /**
   * Clicks an element using Playwright and handles errors gracefully.
   * @param {import('playwright').Page} page - The Playwright page instance.
   * @param {string} locator - The selector or locator for the element.
   */
  async clickElement(locator) {
    try {
      await locator.click();
      // console.log(`Clicked element with locator: ${locator}`);
    } catch (error) {
      console.error(
        `Error clicking element with locator "${locator}":`,
        error.message
      );
      throw error;
    }
  }
  /**
   * Resolves a Playwright locator using built-in strategies.
   * @param {import('playwright').Page} page - The Playwright page instance.
   * @param {object} locatorObj - The locator object with strategy and relevant properties.
   * @returns {import('playwright').Locator} The Playwright locator.
   */
  async buildLocator(locatorObj, page, locator = null, dataYaml) {
    if (
      !locatorObj &&
      Array.isArray(locatorObj.chain) &&
      locatorObj.chain.length > 0
    ) {
      throw new Error("Locator object is empty or invalid.");
    }
    for (const locatorItem of locatorObj.chain) {
      const locatorType = locatorItem.type.toUpperCase();
      if (locator === null) {
        switch (locatorType) {
          case "LOCATOR":
            locator = page.locator(
              locatorItem.value,
              locatorItem.options || {}
            );
            // locator = locator.locator(
            //   locatorItem.value,
            //   locatorItem.options || {}
            // );
            break;

          case "GETBYROLE":
            const options = {...(locatorItem.name && { name: locatorItem.name }),
            };
              locator = page.getByRole(locatorItem.role, options);
              // locator = locator.getByRole(locatorItem.role, options);
            break;

          case "GETBYLABEL":
            locator = page.getByLabel(locatorItem.value);
            break;

          case "GETBYPLACEHOLDER":
            locator = page.getByPlaceholder(locatorItem.placeholder);
            break;

          case "GETBYTEXT":
              locator = page.getByText(locatorItem.value, { exact: true });
              // locator = locator.getByText(locatorItem.value, { exact: true });
            break;

          case "GETBYALTTEXT":
            locator = page.getByAltText(locatorItem.text);
            break;
          case "GETBYALTTEXT":
            locator = page.getByAltText(locatorItem.text);
            break;
          case "FIRST":
            throw new Error('locator is null, please provide a locator');
          case "LAST":
            throw new Error('locator is null, please provide a locator');

          default:
            throw new Error(`Unsupported locator type: ${locatorItem.type}`);
        }
      } else {
        switch (locatorType) {
          case "LOCATOR":
            locator = locator.locator(
              locatorItem.value,
              locatorItem.options || {}
            );
            // locator = locator.locator(
            //   locatorItem.value,
            //   locatorItem.options || {}
            // );
            break;

          case "GETBYROLE":
            const options = {...(locatorItem.name && { name: locatorItem.name }),
            };
              locator = locator.getByRole(locatorItem.role, options);
              // locator = locator.getByRole(locatorItem.role, options);
            break;

          case "GETBYLABEL":
            locator = locator.getByLabel(locatorItem.value);
            break;

          case "GETBYPLACEHOLDER":
            locator = locator.getByPlaceholder(locatorItem.placeholder);
            break;

          case "GETBYTEXT":
              locator = locator.getByText(locatorItem.value, { exact: true });
              // locator = locator.getByText(locatorItem.value, { exact: true });
            break;

          case "GETBYALTTEXT":
            locator = locator.getByAltText(locatorItem.text);
            break;
          case "GETBYALTTEXT":
            locator = locator.getByAltText(locatorItem.text);
            break;
          case "FIRST":
            locator = locator.first();
            break;
          case "LAST":
            locator = locator.last();
            break;  
          case "NTH":
            if(locatorItem.index === undefined || locatorItem.index < 0 || typeof locatorItem.index !== 'number') {
              throw new Error(`Invalid index for NTH locator: ${locatorItem.index}`);
            }
            else{
                locator = locator.nth(locatorItem.index);
            }
            break;

          default:
            throw new Error(`Unsupported locator type: ${locatorItem.type}`);
        }
      }
      if (locatorItem.filter) {
      if (locatorItem.filter.hasText) {
        locator = locator.filter({ hasText: locatorItem.filter.hasText });
      }
    }
    }
  
    return locator;
  }

  /**
   * Executes a specified action on a given locator with optional parameters.
   * @param {string} action - The name of the action to perform (e.g., click, doubleclick, tab, fill).
   * @param {string} locator - The selector used to find the element.
   * @param {any} [value] - Optional value used for actions like fill or key press.
   */
  async executeActions(action, locator, value = null) {
    try {
      const timestamp = new Date().toISOString();
      switch (action.toLowerCase()) {
        case "click":
          await this.clickElement(locator);
          console.log(
            `[${timestamp}] Action: click performed on locator: ${locator}`
          );
          break;

        // case 'doubleclick':
        //     await el.dblclick();
        //     console.log(`[${timestamp}] Action: doubleclick performed on locator: ${locator}`);
        //     break;

        // case 'fill':
        //     if (value === null) throw new Error('Missing value for fill action.');
        //     await el.fill(value);
        //     console.log(`[${timestamp}] Action: fill with "${value}" performed on locator: ${locator}`);
        //     break;

        // case 'hover':
        //     await el.hover();
        //     console.log(`[${timestamp}] Action: hover performed on locator: ${locator}`);
        //     break;

        // case 'presskey':
        //     if (!value) throw new Error('Key value is required for pressKey action.');
        //     await this.page.keyboard.press(value);
        //     console.log(`[${timestamp}] Action: key "${value}" pressed.`);
        //     break;

        // case 'tab':
        //     await this.page.keyboard.press('Tab');
        //     console.log(`[${timestamp}] Action: Tab key pressed.`);
        //     break;

        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    } catch (error) {
      console.error(
        `Error executing action "${action}" on locator "${locator}":`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Resolve a URL based on environment config.
   */
  async goToUrl(url, config) {
    const currentEnv = config.environments.find(
      (env) => env.name === config.env
    );
    if (!currentEnv) {
      throw new Error(`Environment "${config.env}" not found in config file.`);
    }
    const targetUrl = currentEnv.links[url];
    if (!targetUrl && !this.isValidUrl(url)) {
      throw new Error(`URL "${url}" not found in environment "${config.env}".`);
    }
    return targetUrl || url.replace(/^"|"$/g, "");
  }

  async verifyTitlePage(negative, matchType, expectedTitle, page) {
    const actualTitle = await page.title();
    console.log(
      `Page title verification successful. Expected: "${expectedTitle}", Actual: "${actualTitle}"`
    );
    const matchKey = `${negative ? "not " : ""}${matchType}`
      .toLowerCase()
      .trim();
    switch (matchKey) {
      case "equal":
        expect(actualTitle).toBe(expectedTitle);
        break;
      case "contains":
        expect(actualTitle).toContain(expectedTitle);
        break;
      case "not equal":
        expect(actualTitle).not.toBe(expectedTitle);
        break;
      case "not contains":
        expect(actualTitle).not.toContain(expectedTitle);
        break;
      default:
        throw new Error(`Unsupported match type: ${matchType}`);
    }
  }

  /**
   * Validate if a string is a valid URL.
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  async launch(dataCapabilities, appiumServerUrl) {
    const config = pageFixture.getConfig();
    if (config.mode === "mobile") {
      await this.instanceDriver(dataCapabilities, appiumServerUrl);
    } else {
      console.log("Launching desktop browser...");
      await this.getPage();
    }
  }
  /**
   * Launch the browser, create a context, and initialize the page.
   */
  async getPage() {
    try {
      const config = pageFixture.getConfig();
      const browserType = this.getBrowserType();
      const launchOptions = {
        headless: config.headless ?? true,
        executablePath: config.executablePath ?? undefined,
      };
      if (!config.desktop?.viewport) {
        launchOptions.args = launchOptions.args || [];
        launchOptions.args.push("--start-maximized");
      }

      const browser = await browserType.launch(launchOptions);
      const context = await browser.newContext({
        viewport: config.desktop?.viewport || null,
        userDataDir: config.userDataDir ?? undefined,
        ignoreDefaultArgs: config.ignoreDefaultArgs ?? false,
        acceptDownloads: config.acceptDownloads ?? false,
      });

      // pageFixture.setBrowser(browser);
      // pageFixture.setContext(context);
      // pageFixture.setPageFixture(await context.newPage());
      // console.log('Browser and page initialized successfully.');
      // return pageFixture.getPageFixture();

      return browser, context, await context.newPage();
    } catch (error) {
      console.error("Error initializing browser and page:", error.message);
      throw error;
    }
  }

  /**
   * Get the browser type based on the configuration.
   */
  getBrowserType() {
    const browser = pageFixture.getConfig().browser;
    switch (browser) {
      case "chromium":
        return chromium;
      case "firefox":
        return firefox;
      case "webkit":
        return webkit;
      default:
        throw new Error(`Unsupported browser type: ${browser}`);
    }
  }
  async performActionOnElement(action, elementName, page, dataYaml) {
    console.log(elementName, action);
    const locator = await this.buildLocator(
      elementName.locator,
      page,
      null,
      dataYaml
    );
    try {
      await this.executeActions(action, locator);
      console.log(
        `Action "${action}" performed on element "${elementName.id}" with locator "${elementName.locator.value}"`
      );
    } catch (error) {
      console.error(
        `Error performing action "${action}" on element "${elementName.id}":`,
        error.message
      );
      throw error;
    }
    // Optional sleep to ensure the action is completed before proceeding
    console.log(
      `Performing action "${action}" on element "${elementName.id}" with locator "${elementName.locator.value}"`
    );
  }

  /**
   * Launch a mobile application using Appium.
   */
  async instanceDriver(dataCapabilities, appiumServerUrl) {
    console.log("Capabilities:", dataCapabilities);
    if (appiumServerUrl === undefined) {
      appiumServerUrl = process.env.APPIUM_SERVER_URL || "http://127.0.1:4723/";
    }

    // Parse the URL to extract protocol, hostname, port, and path
    const urlObj = new URL(appiumServerUrl);

    const wdOpts = {
      protocol: urlObj.protocol.replace(":", ""),
      hostname: urlObj.hostname,
      port: urlObj.port ? parseInt(urlObj.port, 10) : 4723,
      path: urlObj.pathname,
      logLevel: "info",
      capabilities: dataCapabilities,
    };

    try {
      const driver = await remote(wdOpts);
      if (!driver) {
        throw new Error("Driver was not created!");
      }
      console.log("Appium driver initialized successfully.");
      return driver;
    } catch (err) {
      console.error("Error creating Appium session:", err.message);
      throw err;
    }
  }
}

module.exports = new ManageStepsDefinitions();
