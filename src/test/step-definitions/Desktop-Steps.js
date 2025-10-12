const { Given, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const manageStepsDefinitions = require('../utils/manageStepsDefinitions.js'); // Adjusted path
const pageFixture = require('../../../support/pageFixture.js');
