const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { chromium, firefox, webkit, devices } = require('playwright');

class CustomWorld extends World {
  constructor(options) {
    super(options); // Call the parent constructor
    this.browser = null;
    this.context = null;
    this.page = null;
  }
}
setWorldConstructor(CustomWorld);
