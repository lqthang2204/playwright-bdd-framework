const { Given, Then } = require('@cucumber/cucumber');
const {test, expect } = require('@playwright/test');
const assert = require('assert');


Given('I navigate to url {string}', async function (url) {
  await this.page.goto(url);
});

Given('I verify title this page is {string}', async function (title) {
  await this.page.waitForLoadState('load');
  await expect(this.page).toHaveTitle(title);
});


