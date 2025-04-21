const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { go_to_url } = require('../utils/manageStepsDefinitions.js'); // Adjusted path

Given('I navigate to url {word}', async function (url) {
  // Get the current environment from the config file
  const targetUrl = await go_to_url(url, this.config);
  await this.page.goto(targetUrl, { waitUntil: 'load' });

});

Then('I verify title this page is {string}', async function (expectedTitle) {
  try {
    await this.page.waitForLoadState('load');
    await expect(this.page).toHaveTitle(expectedTitle);
  } catch (error) {
    console.error(`Step failed: ${error.message}`);
    throw error; // Re-throw the error to mark the step as failed
  }
});