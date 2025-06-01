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
async function takeScreenshot(step, page, is_capture) {
  if (!is_capture) {
    console.log('Screenshot capture is disabled. Skipping screenshot.');
    return null;
  }
  if (page && step) {
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
  else {
    console.log('Page or step is not defined. Cannot take screenshot.');
    return null;
  }
  

}

// BeforeAll: Runs once before all scenarios
BeforeAll(async function () {
  try {
    pageFixture.setConfig(config) // Assign the config to the pageFixture object
    console.log(`Global setup: Running before all scenarios in environment "${pageFixture.getConfig().env}".`);
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
  try {
    // Validate step result
    if (!step.result || step.result.status !== 'FAILED') {
      console.log('Step passed or no result available. Skipping screenshot.');
      return;
    }

    // Find the current environment configuration
    const currentEnv = pageFixture.getConfig().environments.find(
      (env) => env.name === pageFixture.getConfig().env
    );

    if (!currentEnv) {
      console.error(`Environment "${pageFixture.getConfig().env}" not found in configuration.`);
      return;
    }

    // Check if screenshots on failure are enabled
    const isScreenshotEnabled = currentEnv.screenshotOnFailure;
    if (!isScreenshotEnabled) {
      console.log('Screenshot on failure is disabled in the configuration. Skipping screenshot.');
      return;
    }

    // Log the failed step
    console.log(`Step failed: ${step.text || 'unknown_step'}`);

    // Take a screenshot
    const screenshotPath = await takeScreenshot(step, pageFixture.getPageFixture(), isScreenshotEnabled);
    if (screenshotPath) {
      // Attach the screenshot to the Cucumber report
      const screenshotData = fs.readFileSync(screenshotPath);
      this.attach(screenshotData, 'image/png');
      console.log(`Screenshot attached to the report: ${screenshotPath}`);
    } else {
      console.log('Failed to capture screenshot.');
    }
  } catch (error) {
    // Log any errors that occur during the AfterStep hook
    logError('Error in AfterStep hook', error);
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