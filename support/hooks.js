const { Before, After } = require('@cucumber/cucumber');
const { setDefaultTimeout } = require('@cucumber/cucumber');

Before(async function () {
  await this.launchBrowser();// from CustomWorld
});

After(async function () {
  await this.closeBrowser(); // from CustomWorld
});
