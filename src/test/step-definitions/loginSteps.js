const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

Given('I navigate to url {string}', async function (url) {
  await this.page.goto(url);
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