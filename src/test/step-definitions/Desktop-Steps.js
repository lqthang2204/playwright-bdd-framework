const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const manageStepsDefinitions = require('../utils/manageStepsDefinitions.js'); // Adjusted path
const pageFixture = require('../../../support/pageFixture.js');

Given('I navigate to url {word}', async function (url) {
  try {
    // Initialize the browser and page
    console.log('Initializing browser and page...');
    await getPage.call(this);

    // Resolve the target URL
    console.log(`Resolving target URL for: ${url}`);
    const targetUrl = manageStepsDefinitions.goToUrl(url, pageFixture.getConfig());

    // Navigate to the target URL
    console.log(`Navigating to: ${targetUrl}`);
    await pageFixture.getPage().goto(targetUrl, { waitUntil: 'load' });

    console.log('Navigation successful.');
  } catch (error) {
    console.error(`Error during navigation to URL "${url}":`, error.message);
    console.error('Stack trace:', error.stack);
    throw error; // Re-throw the error to mark the step as failed
  }

});

Then('I verify title this page is {string}', async function (expectedTitle) {
  try {
    // Wait for the page to load
    console.log('Waiting for the page to load...');
    await pageFixture.getPage().waitForLoadState('load');

    // Get the actual title of the page
    const actualTitle = await pageFixture.getPage().title();
    console.log(`Verifying page title. Expected: "${expectedTitle}", Actual: "${actualTitle}"`);

    // Assert the title matches the expected value
    expect(actualTitle).toBe(expectedTitle);

    console.log('Page title verification successful.');
  } catch (error) {
    console.error(`Error during title verification. Expected: "${expectedTitle}":`, error.message);
    console.error('Stack trace:', error.stack);
    throw error; // Re-throw the error to mark the step as failed
  }
});