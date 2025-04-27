const { setWorldConstructor, setDefaultTimeout, World } = require('@cucumber/cucumber');
const { chromium, firefox, webkit, devices } = require('playwright');
const path = require('path');
const config = require(path.resolve(__dirname, '../config.json'));

class CustomWorld extends World {
  constructor(options) {
    super(options); // Call the parent constructor
    this.browser = null;
    this.context = null;
    this.page = null;
  }
}
setWorldConstructor(CustomWorld);
