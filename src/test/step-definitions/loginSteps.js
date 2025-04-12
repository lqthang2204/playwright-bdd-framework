const { Given, Then } = require('@cucumber/cucumber');
const {test, expect } = require('@playwright/test');

Given('I navigate to url {string}', async function (url) {
  await this.page.goto(url);
});

Given('I verify title this page is {string}', async function (title) {
  expect(await this.page.title()).toContain(title);
});

// Given(/^I navigate to url "(.*)"$/, async function (url) {
//   await this.page.goto(url);
// });

// Given(/^I verify title this page is "(.*)"$/, async function (title) {
//   expect(await this.page.title()).toContain(title);
// });

