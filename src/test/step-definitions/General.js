const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const manageStepsDefinitions = require('../utils/manageStepsDefinitions.js'); // Adjusted path
const pageFixture = require('../../../support/pageFixture.js');
const manageYamlFile = require("../../../libs/ManageYamlFile.js")

    Given('I change the page spec to {word}', async function (fileName) {
           this.dataYaml = await manageYamlFile.readFileYaml(fileName, '../Resources/Pages/', '.yaml')});

    Then('I {word} element Sign-in-button', async function (action) {
          const element = await manageYamlFile.lookUpElementInYaml('Sign-in-button', this.dataYaml);
           console.log(`Performing action "${action}" on element "Sign-in-button"`);
           await manageStepsDefinitions.performActionOnElement(action, element, this.page);
         });
         