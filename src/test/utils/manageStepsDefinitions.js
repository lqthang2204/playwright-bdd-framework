const pageFixture = require('../../../support/pageFixture.js');
const { chromium, firefox, webkit } = require('playwright');
const { remote } = require('webdriverio');
const path = require('path');
const fs = require('fs');

class ManageStepsDefinitions {
  constructor() {
    this.browser = null;
    this.context = null;
  }

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

  /**
   * Launch the browser, create a context, and initialize the page.
   */
  async getPage() {
    try {
      const config = pageFixture.getConfig();
      if (config.mode === 'mobile') {
        console.log('Launching mobile browser...', config.mobile?.device);
        // Mobile browser logic can be implemented here if needed
        // For native mobile, use instanceDriver instead
        return;
      }

      const browserType = this.getBrowserType();
      const launchOptions = {
        headless: config.headless ?? true,
        args: config.mode === 'desktop' ? config.desktop?.args || [] : [],
        executablePath: config.executablePath ?? undefined,
      };
      if (!config.desktop?.viewport) {
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
  async instanceDriver(name_file) {
    const path_file = path.resolve(__dirname, '../../../capabilitiesMobile/' + name_file + '.json');
    let capabilities;
    try {
      const capabilitiesContent = fs.readFileSync(path_file, 'utf-8');
      capabilities = JSON.parse(capabilitiesContent);
    } catch (err) {
      console.error(`Failed to read or parse capabilities file: ${path_file}`);
      throw err;
    }

    console.log(`Opening application with capabilities from: ${path_file}`);
    console.log('Capabilities:', capabilities);

    const wdOpts = {
      protocol: 'http',
      hostname: process.env.APPIUM_HOST || '127.0.0.1',
      port: process.env.APPIUM_PORT ? parseInt(process.env.APPIUM_PORT) : 4723,
      path: '/', // Appium 2.x uses root path
      logLevel: 'info',
      capabilities,
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