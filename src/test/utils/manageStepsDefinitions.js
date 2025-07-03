const pageFixture = require('../../../support/pageFixture.js');
const { chromium, firefox, webkit } = require('playwright');
const { remote } = require('webdriverio');
const path = require('path');
const fs = require('fs');

class ManageStepsDefinitions {

  /**
   * Resolve a URL based on environment config.
   */
  goToUrl(url, config) {
    const currentEnv = config.environments.find(env => env.name === config.env);
    if (!currentEnv) {
      throw new Error(`Environment "${config.env}" not found in config file.`);
    }
    const targetUrl = currentEnv.links[url];
    if (!targetUrl && !this.isValidUrl(url)) {
      throw new Error(`URL "${url}" not found in environment "${config.env}".`);
    }
    return targetUrl || url.replace(/^"|"$/g, '');
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
  if(config.mode === 'mobile'){
     await this.instanceDriver(dataCapabilities, appiumServerUrl);
  }else{
    console.log('Launching desktop browser...');
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
        launchOptions.args.push('--start-maximized');
      }

      const browser = await browserType.launch(launchOptions);
      const context = await browser.newContext({
        viewport: config.desktop?.viewport || null,
        userDataDir: config.userDataDir ?? undefined,
        ignoreDefaultArgs: config.ignoreDefaultArgs ?? false,
        acceptDownloads: config.acceptDownloads ?? false,
      });

      pageFixture.setBrowser(browser);
      pageFixture.setContext(context);
      pageFixture.setPageFixture(await context.newPage());
      console.log('Browser and page initialized successfully.');
      return pageFixture.getPageFixture();
    } catch (error) {
      console.error('Error initializing browser and page:', error.message);
      throw error;
    }
  }

  /**
   * Get the browser type based on the configuration.
   */
  getBrowserType() {
    const browser = pageFixture.getConfig().browser;
    switch (browser) {
      case 'chromium':
        return chromium;
      case 'firefox':
        return firefox;
      case 'webkit':
        return webkit;
      default:
        throw new Error(`Unsupported browser type: ${browser}`);
    }
  }

  /**
   * Launch a mobile application using Appium.
   */
  async instanceDriver(dataCapabilities, appiumServerUrl) {
    console.log('Capabilities:', dataCapabilities);
    if (appiumServerUrl=== undefined) {
      appiumServerUrl = process.env.APPIUM_SERVER_URL || 'http://127.0.1:4723/'; 
    }

  // Parse the URL to extract protocol, hostname, port, and path
  const urlObj = new URL(appiumServerUrl);

  const wdOpts = {
    protocol: urlObj.protocol.replace(':', ''),
    hostname: urlObj.hostname,
    port: urlObj.port ? parseInt(urlObj.port, 10) : 4723,
    path: urlObj.pathname,
    logLevel: 'info',
    capabilities: dataCapabilities
  };

    try {
      const driver = await remote(wdOpts);
      if (!driver) {
        throw new Error('Driver was not created!');
      }
      pageFixture.setDriver(driver);
      console.log('Appium driver initialized successfully.');
      return driver;
    } catch (err) {
      console.error('Error creating Appium session:', err.message);
      throw err;
    }
  }
}

module.exports = new ManageStepsDefinitions();