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
