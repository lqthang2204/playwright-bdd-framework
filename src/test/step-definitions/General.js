const { Given, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");
const manageStepsDefinitions = require("../utils/manageStepsDefinitions.js"); // Adjusted path
const pageFixture = require("../../../support/pageFixture.js");
const manageYamlFile = require("../../../libs/ManageYamlFile.js");
const chalk = require("chalk");
const ManageStepsDefinitionsMobile= require("../utils/ManageStepsDefinitionsMobile.js");
const WebSteps = require("./WebSteps.js");

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
  }else{
    device = "DESKTOP";
  }
  
  const locatorItem = await manageYamlFile.lookUpElementInYaml(
    elementId,
    this.dataYaml, device
  );
  console.log(`Performing action "${action}" on element "${elementId}"`);
  // if(pageFixture.getConfig().mode === 'DESKTOP')
  // {
  //   await manageStepsDefinitions.performActionOnElement(
  //   action,
  //   locatorItem,
  //   this.page,
  //   this.dataYaml
  // );
  // }else{
  //   const element = await ManageStepsDefinitionsMobile.resolveLocatorMobile(this.driver, locatorItem)
  //   await ManageStepsDefinitionsMobile.executeActions(action, element)

  // }
  if (device.toUpperCase() === "DESKTOP") {
    const webSteps = new WebSteps(this.page);
    const locator = await web
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
      console.log(`Resolving target URL for: ${url}`);
      const targetUrl = await manageStepsDefinitions.goToUrl(url, pageFixture.getConfig());
       console.log(`Navigating to: ${targetUrl}`);
    try {
    if(pageFixture.getConfig().mode === 'mobile'){
      await this.driver.url(targetUrl)
      console.log('Navigation successful in mobile mode.');
      return;
    }else{
 // Initialize the browser and page
    console.log('Initializing browser and page...');
    await this.launchBrowser();
   
    await this.page.goto(targetUrl, { waitUntil: 'load' , timeout: pageFixture.getTimeout()});
    await this.page.setDefaultTimeout(pageFixture.getTimeout()); // Set the default timeout for actions on this page

    console.log('Navigation successful.');
    }

   
  } catch (error) {
    console.error(`Error during navigation to URL "${url}":`, error.message);
    console.error('Stack trace:', error.stack);
    throw error; // Re-throw the error to mark the step as failed
  }

});
       
    Given("I {word} {string} into element {word}", async function (action, value, elementId) {
  try {
    //  Detect current execution mode (DESKTOP or MOBILE)
    const config = pageFixture.getConfig();
    const mode = config.mode?.toUpperCase() || "DESKTOP";
    let device = "DESKTOP";

    if (mode === "MOBILE") {
      if (config.mobile && config.mobile.device) {
        device = config.mobile.device;
        console.log(chalk.cyan(`[INFO] Running in mobile mode. Device: ${device}`));
      } else {
        throw new Error("Mobile device configuration is missing in config.");
      }
    } else {
      console.log(chalk.cyan(`[INFO] Running in desktop mode.`));
    }

    // Retrieve locator object from YAML based on the device type
    const locatorItem = await manageYamlFile.lookUpElementInYaml(
      elementId,
      this.dataYaml,
      device
    );

    console.log(
      chalk.blue(
        `Performing action "${action}" with value "${value}" on element "${elementId}"`
      )
    );

    // Execute the action depending on the current platform
    if (mode === "DESKTOP") {
      const steps = new WebSteps(this.page);
      const locator = await steps.resolveLocator(locatorItem);
      await steps.execute(action, locator, value);
    } else if (mode === "MOBILE") {
      const steps = new MobileSteps(this.driver);
      const locator = await steps.resolveLocator(locatorItem);
      await steps.execute(action, locator, value);
    } else {
      throw new Error(`Unsupported mode: ${mode}`);
    }

    //  Log success message
    console.log(
      chalk.green(
        `✅ Action "${action}" with value "${value}" performed on element "${elementId}" successfully.`
      )
    );
  } catch (error) {
    // 5️⃣ Catch and display any runtime errors
    console.error(
      chalk.red(
        `❌ Error performing action "${action}" on element "${elementId}": ${error.message}`
      )
    );
    console.error(chalk.gray(error.stack));
    throw error; // Re-throw error so Cucumber marks the step as failed
  }
});
Then('I verify title this page is {string}', async function (expectedTitle) {
  try {
    // Wait for the page to load
     const steps = new WebSteps(this.page);
    console.log('Waiting for the page to load...');
    await pageFixture.getPageFixture().waitForLoadState('load');

    // Get the actual title of the page
    const actualTitle = await pageFixture.getPageFixture().title();
    console.log(`Verifying page title. Expected: "${expectedTitle}", Actual: "${actualTitle}"`);

    // Assert the title matches the expected value
    steps.execute("VERIFY TITLE", null, expectedTitle);
    expect(actualTitle).toBe(expectedTitle);

    console.log('Page title verification successful.');
  } catch (error) {
    console.error(`Error during title verification. Expected: "${expectedTitle}":`, error.message);
    console.error('Stack trace:', error.stack);
    throw error; // Re-throw the error to mark the step as failed
  }
});