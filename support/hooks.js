const { Before, After, AfterStep, BeforeAll, setDefaultTimeout } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');
const pageFixture = require('../support/pageFixture.js');
const config = require('../config.json');


// Set the default timeout for Cucumber steps (e.g., 60 seconds)
const unifiedTimeout = parseInt(config.setDefaultTimeout) || 60000;
setDefaultTimeout(unifiedTimeout);

// Helper function to log errors
function logError(message, error) {
  console.error(`${message}: ${error.message}`);
}

// Helper function to take a screenshot
async function takeScreenshot(step, page) {
  try {
    const screenshotDir = path.resolve(__dirname, '../reports/screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true }); // Create the directory if it doesn't exist
    }

    const stepName = step.pickle?.name || step.text || 'unknown_step';
    const sanitizedStepName = stepName.replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize the step name
    const screenshotPath = path.resolve(screenshotDir,`${sanitizedStepName}.png`);

    console.log(`Taking screenshot for failed step: ${step.pickle.name}`);
    await page.screenshot({ path: screenshotPath });

    console.log(`Screenshot saved at: ${screenshotPath}`);
    return screenshotPath;
  } catch (error) {
    logError('Error taking screenshot', error);
    return null;
  }
}

// BeforeAll: Runs once before all scenarios
BeforeAll(async function () {
  try {
    pageFixture.config = config; // Assign the config to the pageFixture object
    console.log(`Global setup: Running before all scenarios in environment "${pageFixture.config.env}".`);
  } catch (error) {
    throw new Error(`Error during global setup: ${error.message}`);
    
  }
});

// Before: Runs before each scenario
Before(async function (scenario) {
  console.log(`Starting scenario: ${scenario.pickle.name}`);
});

// AfterStep: Runs after each step
AfterStep(async function (step) {
  if (step.result && step.result.status === 'FAILED') {
    console.log(`Step failed: ${step.text}`);
    const screenshotPath = await takeScreenshot(step, pageFixture.page);

    if (screenshotPath) {
      const screenshotData = fs.readFileSync(screenshotPath);
      this.attach(screenshotData, 'image/png'); // Attach the screenshot to the Cucumber report
    }
  }
});

// After: Runs after each scenario
After(async function () {
  console.log('Scenario teardown: Closing browser...');
  try {
    if (this.page) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  } catch (error) {
    logError('Error during browser teardown', error);
  }
});