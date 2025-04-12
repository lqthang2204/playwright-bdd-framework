const { Before, After } = require('@cucumber/cucumber');

Before(async function () {
  await this.launchBrowser(); // from CustomWorld
});

After(async function () {
  await this.closeBrowser(); // from CustomWorld
});
