const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const manageStepsDefinitions = require('../utils/manageStepsDefinitions.js'); // Adjusted path
const pageFixture = require('../../../support/pageFixture.js');
const manageYamlFile = require("../../../libs/ManageYamlFile.js")

    Given('I change the page spec to {word}', async function (fileName) {
           // Write code here that turns the phrase above into concrete actions
           const data = await manageYamlFile.readFileYaml(fileName, '../Resources/Pages/', '.yaml')
           console.log("data", data);
           console.log("Map contain value is", pageFixture.getMapLocator().entries());
         });