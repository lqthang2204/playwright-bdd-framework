const { Before, After,AfterStep, BeforeAll } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');
const pageFixture = require('../support/pageFixture.js')
const config = require('../config.json'); 

BeforeAll(async function(){
    pageFixture.config = config; // Assign the config to the pageFixture object`
    console.log(`Running before all scenarios "${pageFixture.config.env}".`);  
  
})

Before(async function () {
  // Check if the browser is already launched  
  await this.launchBrowser(); // from CustomWorld
});

AfterStep(async function(step) {
  console.log(`step result: ${step.result.status}`);
  if(step.result.status === 'FAILED'){
    console.log(`Step failed: ${step.pickle.name}`);
    // Define the screenshot path
    const screenshotPath = path.resolve(
      __dirname,
      `../../reports/screenshots/${step.pickle.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`
    );
    console.log(`Screenshot path: ${screenshotPath}`);

    // Take a screenshot and save it to the specified path
    await this.page.screenshot({ path: screenshotPath });

    // Attach the screenshot to the Cucumber report
    const screenshotData = fs.readFileSync(screenshotPath); // Read the file from the path
    this.attach(screenshotData, 'image/png'); // Attach the screenshot to the report

    console.log(`Screenshot saved at: ${screenshotPath}`);
  }
});
After(async function (scenario) {
// Close the browser after each scenario
  await this.closeBrowser(); // from CustomWorld
});