/**
 * A shared object to manage the browser, context, page, and configuration during tests.
 */
class PageFixture {
  constructor() {
    this.page = undefined;
    this.context = undefined;
    this.browser = undefined;
    this.config = undefined;
    this.driver = undefined;
    this.MapYamlFile = new Map();
    this.flag = true // Should be an instance of Map
  }
  /**
   * set the page instance.
   * @param {import('playwright').Page} page - The Playwright page instance.
   *
   */
  setPageFixture(page) {
    this.page = page;
  }
  /**
   * get the current page instance.
   * @returns {import('playwright').Page | undefined}  - The current Playwright page instance.
   */
  getPageFixture() {
    return this.page;
  }
  /**
   * set the bropwser instance
   * @param {import('playwright').Browser} browser - The Playwright browser instance.
   */
  setBrowser(browser) {
    this.browser = browser;
  }
  /**
   * get the current browser instance
   * @returns {import('playwright').Browser | undefined} - The current Playwright browser instance.
   */
  getBrowser() {
    return this.browser;
  }
  /**
   * set the browser context instance
   * @param {import('playwright').BrowserContext} context - The Playwright browser context instance.
   */
  setContext(context) {
    this.context = context;
  }
  /**
   * get the current browser context instance
   * @returns {import('playtwright').BrowserContext | undefined} - The current Playwright browser context instance.
   */
  getContext() {
    return this.context;
  }
  /**
   * set the configuration object
   * @param {object} config - The configuration object.
   */
  setConfig(config) {
    this.config = config;
  }
  /**
   * get the current configuration object
   * @returns {object | undefined} - The current configuration object.
   */
  getConfig() {
    return this.config;
  }

  /**
   * set the driver instance
   * @param {import('webdriverio').Remote} driver - The WebDriverIO remote instance.
   */
  setDriver(driver) {
    this.driver = driver;
  }
  /**
   * get the current driver instance
   * @returns {import('webdriverio').Remote | undefined} - The current WebDriverIO remote instance.
   */
  getDriver() {
    return this.driver;
  }
  /**
   * Set the locator map object for the current test context.
   * This is typically a mapping of element identifiers to their selectors or locator strategies,
   * loaded from a YAML or JSON file for use in page object or step definitions.
   * @param {object} MapYamlFile - The locator map object.
   */
  setMapLocator(MapYamlFile) {
    this.MapYamlFile = MapYamlFile;
  }

  /**
   * Get the current locator map object.
   * @returns {object | undefined} The locator map object if set, otherwise undefined.
   */
  getMapLocator() {
    return this.MapYamlFile;
  }
  /**
   * set value for flag when read file Yaml
   * @param {boolean} flag - The flag value to set.
   */
  setFlag(flag){
    this.flag = flag
  }
  /**
   * get value for flag when read file Yaml
   * @returns {boolean} - The current flag value.
   */
  getFlag(){
    return this.flag;
  }
  /**
   * Reset the page fixture, clearing all stored instances.
   */

  reset() {
    this.page = undefined;
    this.context = undefined;
    this.browser = undefined;
    this.config = undefined;
  }
}
module.exports = new PageFixture();
