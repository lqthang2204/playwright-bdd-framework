
const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const manageStepsDefinitions = require('../utils/manageStepsDefinitions.js'); // Adjusted path
const pageFixture = require('../../../support/pageFixture.js');
const path = require('path');
const fs = require('fs');
const managetable = require('../../../libs/dataTable.js');

Given('I open application with config below', async function (dataTable) {
    console.log('Opening application with config below:', dataTable);
    // Override the data table with the capabilities file
    const {capabilities, appiumServerUrl} = await managetable.OverrideTable(dataTable); // Assuming dataTable is a single cell with the path to the config file
    await this.launchApplication(capabilities, appiumServerUrl);
    console.log('Application opened with config:', capabilities);
    
}
);