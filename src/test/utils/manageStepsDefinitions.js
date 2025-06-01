const pageFixture = require('../../../support/pageFixture.js');
const { chromium, firefox, webkit, devices } = require('playwright');
const {remote}  = require('webdriverio');
const path = require('path');
const fs = require('fs');

/**
 * Get the target URL based on the environment and configuration.
 * @param {string} url - The URL or key to look up in the environment config.
 * @param {object} config - The configuration object.
 * @returns {string} - The resolved target URL.
 */
class manageStepsDefinitions {
  constructor() {
    this.browser = null;
    this.context = null;
  }
   goToUrl(url, config) {
  const currentEnv = config.environments.find(env => env.name === config.env);
  if (!currentEnv) {
    throw new Error(`Environment "${config.env}" not found in config file.`);
  }

  const targetUrl = currentEnv.links[url];
  if (!targetUrl && !this.isValidUrl(url)) {
    throw new Error(`URL "${url}" not found in environment "${config.env}".`);
  }

  return targetUrl || url.replace(/^"|"$/g, ''); // Remove quotes if present
}

/**
 * Validate if a string is a valid URL.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if the URL is valid, false otherwise.
 */
 isValidUrl(url) {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" // Optional protocol (http or https)
  );
  return urlPattern.test(url);
}

/**
 * Launch the browser, create a context, and initialize the page.
 * @returns {Promise<void>}
 */
/**
 * Launch the browser, create a context, and initialize the page.
 * @returns {Promise<void>}
 */
async getPage() {
  try {
  
    // Create a new browser context based on the mode (desktop or mobile)
    if (pageFixture.getConfig().mode === 'mobile') {
      console.log('Launching mobile browser...');
      
      // const capabilities = getCapabilities()
      

      console.log('Launching mobile browser...', pageFixture.getConfig().mobile.device);

      
    } else {
      const browserType = this.getBrowserType(); // Get the browser type dynamically
      const config = pageFixture.getConfig(); // Access the global config
  
      // Define launch options
      const launchOptions = {
        headless: config.headless ?? true,
        args: config.mode === 'desktop' ? config.desktop?.args || [] : [],
        executablePath: config.executablePath ?? undefined,
      };
          // Add `--start-maximized` if viewport is null
      if (!config.desktop?.viewport) {
        launchOptions.args.push('--start-maximized');
      }
  
      // Launch the browser
      let browser = await browserType.launch(launchOptions);
      let context = await browser.newContext({
        viewport: config.desktop?.viewport || null,
        userDataDir: config.userDataDir ?? undefined,
        ignoreDefaultArgs: config.ignoreDefaultArgs ?? false,
        acceptDownloads: config.acceptDownloads ?? false,
      });
      pageFixture.setBrowser(browser)
      pageFixture.setContext(context);
      pageFixture.setPageFixture(await context.newPage());
    }

    // Create a new page and assign it to the pageFixture
  
  } catch (error) {
    console.error('Error initializing browser and page:', error.message);
    throw error; // Re-throw the error to ensure it is handled by the caller
  }
}

/**
 * Get the browser type based on the configuration.
 * @returns {object} - The Playwright browser type (chromium, firefox, or webkit).
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
// ...existing code...
 async instanceDriver(name_file) {
  const path_file = path.resolve(__dirname, '../../../capabilitiesMobile/' + name_file + '.json');

  // Read and parse the JSON file
  const capabilitiesContent = fs.readFileSync(path_file, 'utf-8');
  const capabilities = JSON.parse(capabilitiesContent);
  console.log(`Opening application with capabilities from: ${path_file}`);
  console.log('Capabilities:', capabilities);

const wdOpts = {
  protocol: 'http', // Thêm dòng này
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: process.env.APPIUM_PORT ? parseInt(process.env.APPIUM_PORT) : 4723,
  path: '/', 
  logLevel: 'info',
  capabilities,
}


// ...existing code...
  try {
    const driver = await remote(wdOpts);
    if (!driver) {
      console.error('Driver was not created!');
      throw new Error('Driver was not created!');
    }
    console.log('Driver created, getting session...');
    pageFixture.setDriver(driver);
  } catch (err) {
    console.error('Error creating Appium session:', err.message);
    console.error(err.stack);
    throw err;
  }
} 
}

module.exports = new manageStepsDefinitions();