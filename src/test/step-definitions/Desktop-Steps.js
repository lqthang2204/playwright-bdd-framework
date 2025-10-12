const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const manageStepsDefinitions = require('../utils/manageStepsDefinitions.js'); // Adjusted path
const pageFixture = require('../../../support/pageFixture.js');


Then(/^I verify title this page is( not)? (\w+) "(.*)"$/, async function (negative, matchType, expectedTitle) {
  try {
    // Wait for the page to load
    console.log('Waiting for the page to load...');
    await this.page.waitForLoadState('load');

    // Get the actual title of the page
    // const actualTitle = await this.page.title();
    // console.log(`Verifying page title. Expected: "${expectedTitle}", Actual: "${actualTitle}"`);

    // // Assert the title matches the expected value
    // expect(actualTitle).toBe(expectedTitle);
    await manageStepsDefinitions.verifyTitlePage(negative, matchType, expectedTitle, this.page);

    console.log('Page title verification successful.');
  } catch (error) {
    console.error(`Error during title verification. Expected: "${expectedTitle}":`, error.message);
    console.error('Stack trace:', error.stack);
    throw error; // Re-throw the error to mark the step as failed
  }
});