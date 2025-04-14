const { setWorldConstructor, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, firefox, webkit, devices } = require('playwright');
const path = require('path');
const config = require(path.resolve(__dirname, '../config.json'));

setDefaultTimeout(parseInt(config.setDefaultTimeout) || 60000); // <-- Set global timeout

class CustomWorld {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.config = config;
  }

  async launchBrowser() {
    const browserType = this._getBrowserType(); // 'chromium', 'firefox', or 'webkit'
    // Desktop or mobile args
    const args = this.config.mode === 'desktop' ? this.config.desktop.args : [];
    const launchOptions = {
      headless: this.config.headless ?? true,
      args: args,
      executablePath: this.config.executablePath ?? undefined,
    };
    this.browser = await browserType.launch(launchOptions);

    if (this.config.mode === 'mobile') {  
      const device = devices[this.config.device];
      this.context = await thhis.browser.newContext({
        ...device,
        ...this.config.mobile.viewport,
      });
    }else{
      this.context = await this.browser.newContext({
        viewport: this.config.desktop.viewport,
        userDataDir: this.config.userDataDir ?? undefined,
        ignoreDefaultArgs: this.config.ignoreDefaultArgs ?? false,
        acceptDownloads: this.config.acceptDownloads ?? false,
        userDataDir: this.config.userDataDir ?? undefined,
        viewport: this.config.viewport ?? null,
      });
    }
    this.page = await this.context.newPage();
  }

  async closeBrowser() {
    await this.browser?.close();
  }

  _getBrowserType() {
    switch (this.config.browser) {
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
