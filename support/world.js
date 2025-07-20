const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { chromium, firefox, webkit, devices } = require('playwright');
const manageStepsDefinitions = require('../src/test/utils/manageStepsDefinitions.js');
const pageFixture = require('./pageFixture.js'); // Adjusted path

class CustomWorld extends World {
  constructor(options) {
    super(options); // Call the parent constructor
    this.browser = null;
    this.context = null;
    this.page = null;
    this.driver = null
  }
  async launchBrowser() {
    try {
      this.browser, this.context, this.page = await manageStepsDefinitions.getPage();
      console.log('Browser, context, and page initialized successfully.');
    } catch (error) {
      console.error('Error initializing browser, context, or page:', error.message);
      throw error;
    }
    
    
  }
 async launchApplication(dataCapabilities, appiumServerUrl) {
   const config = pageFixture.getConfig();
   if(config.mode === 'mobile'){
      this.driver = await manageStepsDefinitions.instanceDriver(dataCapabilities, appiumServerUrl);
   }else{
    throw new Error('Launching application is only supported in mobile mode');
   }
 }
}
setWorldConstructor(CustomWorld);
