const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const manageStepsDefinitions = require('../utils/manageStepsDefinitions.js'); // Adjusted path
const pageFixture = require('../../../support/pageFixture.js');
const manageYamlFile = require("../../../libs/ManageYamlFile.js")
const chalk = require('chalk');

    Given('I change the page spec to {word}', async function (fileName) {
           this.dataYaml = await manageYamlFile.readFileYaml(fileName, '../Resources/Pages/', '.yaml')});

    Then('I {word} element {word}', async function (action, elementId) {

          const element = await manageYamlFile.lookUpElementInYaml(elementId, this.dataYaml);
           console.log(`Performing action "${action}" on element "${elementId}"`);
           await manageStepsDefinitions.performActionOnElement(action, element, this.page, this.dataYaml);
           console.log(`Action "${action}" performed on element "${elementId}" successfully.`);
         });
    Given('I wait {int} seconds', async function (seconds) {
      const waitTime = Number(seconds);
      if (!Number.isFinite(waitTime) || waitTime < 0) {
        throw new Error(`Invalid wait time: ${seconds}. Please provide a non-negative integer.`);
      }
      console.log(chalk.green(`[WAIT] Pausing for ${waitTime} second(s)...`));
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    console.log(chalk.green(`[WAIT] Done waiting for ${waitTime} second(s).`));
    });