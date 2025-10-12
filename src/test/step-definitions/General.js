const { Given, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");
const manageStepsDefinitions = require("../utils/manageStepsDefinitions.js"); // Adjusted path
const pageFixture = require("../../../support/pageFixture.js");
const manageYamlFile = require("../../../libs/ManageYamlFile.js");
const chalk = require("chalk");
const ManageStepsDefinitionsMobile= require("../utils/ManageStepsDefinitionsMobile.js");

Given("I change the page spec to {word}", async function (fileName) {
  this.dataYaml = await manageYamlFile.readFileYaml(
    fileName,
    "../Resources/Pages/",
    ".yaml"
  );
});

Then("I {word} element {word}", async function (action, elementId) {
  let device = null;
  if (pageFixture.getConfig().mode === 'mobile') {
    const config = pageFixture.getConfig();
    if (config.mobile && config.mobile.device) {
      device = config.mobile.device;
      console.log(`[INFO] Running in mobile mode. Device: ${device}`);
    } else {
      throw new Error('Mobile device configuration is missing in config.');
    }
  }
  const locatorItem = await manageYamlFile.lookUpElementInYaml(
    elementId,
    this.dataYaml, device
  );
  console.log(`Performing action "${action}" on element "${elementId}"`);
  if(pageFixture.getConfig().mode === 'DESKTOP')
  {
    await manageStepsDefinitions.performActionOnElement(
    action,
    locatorItem,
    this.page,
    this.dataYaml
  );
  }else{
    const element = await ManageStepsDefinitionsMobile.resolveLocatorMobile(this.driver, locatorItem)
    await ManageStepsDefinitionsMobile.executeActions(action, element)

  }
  
  console.log(
    `Action "${action}" performed on element "${elementId}" successfully.`
  );
});

Given("I wait {int} seconds", async function (seconds) {
  const waitTime = Number(seconds);
  if (!Number.isFinite(waitTime) || waitTime < 0) {
    throw new Error(
      `Invalid wait time: ${seconds}. Please provide a non-negative integer.`
    );
  }
  console.log(chalk.green(`[WAIT] Pausing for ${waitTime} second(s)...`));
  await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
  console.log(chalk.green(`[WAIT] Done waiting for ${waitTime} second(s).`));
});
Given('I navigate to url {word}', async function (url) {
  try {
    // Initialize the browser and page
    
    // Resolve the target URL
    console.log(`Resolving target URL for: ${url}`);
    const targetUrl = await manageStepsDefinitions.goToUrl(url, pageFixture.getConfig());

    // Navigate to the target URL
    console.log(`Navigating to: ${targetUrl}`);
    if(pageFixture.getConfig().mode === 'mobile'){
      await this.driver.url(targetUrl);
      console.log('Navigation successful in mobile mode.');
      return;
    }else{
      console.log('Initializing browser and page...');
      await this.launchBrowser();

      await this.page.goto(targetUrl, { waitUntil: 'load' , timeout: pageFixture.getTimeout()});
      await this.page.setDefaultTimeout(pageFixture.getTimeout()); // Set the default timeout for actions on this page
    }
    console.log('Navigation successful.');
  } catch (error) {
    console.error(`Error during navigation to URL "${url}":`, error.message);
    console.error('Stack trace:', error.stack);
    throw error; // Re-throw the error to mark the step as failed
  }

});


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
