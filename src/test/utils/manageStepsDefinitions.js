const pageFixture = require('../../../support/pageFixture.js');
const { chromium, firefox, webkit, devices } = require('playwright');

/**
 * Get the target URL based on the environment and configuration.
 * @param {string} url - The URL or key to look up in the environment config.
 * @param {object} config - The configuration object.
 * @returns {string} - The resolved target URL.
 */
function goToUrl(url, config) {
  const currentEnv = config.environments.find(env => env.name === config.env);
  if (!currentEnv) {
    throw new Error(`Environment "${config.env}" not found in config file.`);
  }

  const targetUrl = currentEnv.links[url];
  if (!targetUrl && !isValidUrl(url)) {
    throw new Error(`URL "${url}" not found in environment "${config.env}".`);
  }

  return targetUrl || url.replace(/^"|"$/g, ''); // Remove quotes if present
}

/**
 * Validate if a string is a valid URL.
 * @param {string} url - The URL to validate.
 * @returns {boolean} - True if the URL is valid, false otherwise.
 */
function isValidUrl(url) {
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
async function getPage() {
  try {
    const browserType = getBrowserType(); // Get the browser type dynamically
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
      browser = await browserType.launch(launchOptions);

    // Create a new browser context based on the mode (desktop or mobile)
    if (config.mode === 'mobile') {
      const device = devices[config.device];
      context = await pageFixture.getBrowser().newContext({
        ...device,
        ...config.mobile?.viewport,
      });
    } else {
      context = await browser.newContext({
        viewport: config.desktop?.viewport || null,
        userDataDir: config.userDataDir ?? undefined,
        ignoreDefaultArgs: config.ignoreDefaultArgs ?? false,
        acceptDownloads: config.acceptDownloads ?? false,
      });
    }

    // Create a new page and assign it to the pageFixture
    pageFixture.setBrowser(browser)
    pageFixture.setContext(context);
    pageFixture.setPage(await context.newPage());
  } catch (error) {
    console.error('Error initializing browser and page:', error.message);
    throw error; // Re-throw the error to ensure it is handled by the caller
  }
}

/**
 * Get the browser type based on the configuration.
 * @returns {object} - The Playwright browser type (chromium, firefox, or webkit).
 */
function getBrowserType() {
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

module.exports = {
  goToUrl,
  getPage,
};