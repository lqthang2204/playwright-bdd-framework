const { setWorldConstructor } = require('@cucumber/cucumber');
const { chromium, firefox, webkit, devices } = require('playwright');
const path = require('path');
const config = require(path.resolve(__dirname, '../config.json'));

class CustomWorld {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.config = config;
  }

async launchBrowser() {
  const browserType = this._get_BrowserType();// 'chromium', 'firefox', or 'webkit'
  const launchOptions = {
    headless: this.config.headless,
    args: this.config.args,
    extcutablePath: this.config.executablePath,
    timeout: this.config.timeout,
    
  }
  this.browser = await browserType.launch(launchOptions);
  this.context = await this.browser.newContext({
    viewport: this.config.viewport,
    ignoreDefaultArgs: this.config.ignoreDefaultArgs,
    acceptDownloads: this.config.acceptDownloads,
    geolocation: this.config.geolocation,
    permissions: this.config.permissions,
    locale: this.config.locale,
    timezoneId: this.config.timezoneId,
  });
  this.page = await this.context.newPage();

}
async closeBrowser() {
  await this.browser?.close();
}


_get_BrowserType() { 
  switch (this.config.browser){
    case 'chromium':
      return chromium;
    case 'firefox':
      return firefox;
    case 'webkit':
      return webkit;
    default:
      throw new Error(`Unsupported browser type: ${this.config.browser}`);
  }
}
}
setWorldConstructor(CustomWorld);