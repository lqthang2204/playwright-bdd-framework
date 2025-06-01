
const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const manageStepsDefinitions = require('../utils/manageStepsDefinitions.js'); // Adjusted path
const pageFixture = require('../../../support/pageFixture.js');
const path = require('path');
const fs = require('fs');


Given('I open application with config below', async function (dataTable) {
    console.log('Opening application with config below:', dataTable);
    data = dataTable.raw()[0][0]; // Assuming dataTable is a single cell with the path to the config file
    await manageStepsDefinitions.instanceDriver.call(this, data)
    console.log('Application opened with config:', data);
    
}
);