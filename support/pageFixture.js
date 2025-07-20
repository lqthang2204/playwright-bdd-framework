/**
 * A shared object to manage the browser, context, page, and configuration during tests.
 */
class PageFixture {
  constructor() {
    this.config = undefined;
    this.MapYamlFile = new Map();
    this.flag = true // Should be an instance of Map
    this.timeout = 3000; // Default timeout
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
   * Set a timeout for operations.
   * @param {number} timeout - The timeout value in milliseconds.
   */
  setTimeout(timeout) {
    this.timeout = timeout;
  }
  /**
   * 
   * @returns {number} - The current timeout value in milliseconds.
   */
  getTimeout() {
    return this.timeout;
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
