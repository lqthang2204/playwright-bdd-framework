const { Given, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");
const manageStepsDefinitions = require("../utils/manageSteps.js"); // Adjusted path
const pageFixture = require("../../../support/pageFixture.js");
const manageYamlFile = require("../../../libs/ManageYamlFile.js");
const chalk = require("chalk");
const WebSteps = require("./WebSteps.js");
const ManageMode = require("../utils/ManageMode.js");
const MobileSteps = require("./MobileSteps.js");
const genenal = require("../../../libs/general.js");
const self_healing = require("../../../libs/self-healingAI.js");


Given("I change the page spec to {word}", async function (fileName) {
  this.fileName = fileName;
  this.dataYaml = await manageYamlFile.readFileYaml(
    fileName,
    "../Resources/Pages/",
    ".yaml",
  );
});

Then(/^I (\w+)(?: to)? element ([\w-]+)$/, async function (action, elementId) {
  // 1️⃣ Detect current execution mode (DESKTOP or MOBILE)
  // 1️⃣ Detect current execution mode (DESKTOP or MOBILE)
  let _executionContext = ManageMode.getExecutionContext();

  const locatorItem = await manageYamlFile.lookUpElementInYaml(
    elementId,
    this.dataYaml,
    _executionContext.device,
  );
  console.log(
    chalk.blue(`Performing action "${action}" on element "${elementId}"`),
  );

  // }
  if (_executionContext.mode === "DESKTOP") {
    const steps = new WebSteps(this.page);
    const locator = await steps.resolveLocator(locatorItem);
    await steps.execute(action, locator, null, elementId, this.dataYaml, this.fileName, locatorItem);
  } else if (_executionContext.mode === "MOBILE") {
    const steps = new MobileSteps(this.driver);
    const locator = await steps.resolveLocator(locatorItem);
    await steps.execute(action, locator, null, elementId, this.dataYaml, this.fileName, locatorItem);
  } else {
    throw new Error(`Unsupported mode: ${_executionContext.mode}`);
  }
  console.log(
    chalk.blue(
      `Action "${action}" performed on element "${elementId}" successfully.`,
    ),
  );
});

Given("I wait {int} seconds", async function (seconds) {
  const waitTime = Number(seconds);
  if (!Number.isFinite(waitTime) || waitTime < 0) {
    throw new Error(
      `Invalid wait time: ${seconds}. Please provide a non-negative integer.`,
    );
  }
  console.log(chalk.green(`[WAIT] Pausing for ${waitTime} second(s)...`));
  await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
  console.log(chalk.green(`[WAIT] Done waiting for ${waitTime} second(s).`));
});
Given("I navigate to url {word}", async function (url) {
  const result = await genenal.processEnvVariable(url);
  const targetUrl = await manageStepsDefinitions.goToUrl(result.value, pageFixture.getConfig());
  try {
    if (pageFixture.getConfig().mode === "mobile") {
      await this.driver.url(targetUrl);
      console.log("Navigation successful in mobile mode.");
      return;
    } else {
      // Initialize the browser and page
      console.log("Initializing browser and page...");
      await this.launchBrowser();

      await this.page.goto(targetUrl, {
        waitUntil: "load",
        timeout: pageFixture.getTimeout(),
      });
      await this.page.setDefaultTimeout(pageFixture.getTimeout()); // Set the default timeout for actions on this page

      console.log("Navigation successful.");
    }
  } catch (error) {
    console.error(`Error during navigation to URL:`, error.message);
    console.error("Stack trace:", error.stack);
    throw error; // Re-throw the error to mark the step as failed
  }
});

Given(
  "I {word} {string} into element {word}",
  async function (action, value, elementId) {
    try {
      const result = await genenal.processEnvVariable(value);
      // value = await genenal.formaInput(value);
      //  Detect current execution mode (DESKTOP or MOBILE)
      const _executionContext = ManageMode.getExecutionContext();
      // Retrieve locator object from YAML based on the device type
      const locatorItem = await manageYamlFile.lookUpElementInYaml(
        elementId,
        this.dataYaml,
        _executionContext.device,
      );
      // Execute the action depending on the current platform
      if (_executionContext.mode === "DESKTOP") {
        const steps = new WebSteps(this.page);
        const locator = await steps.resolveLocator(locatorItem);
        await steps.execute(action, locator, result.value, elementId, this.dataYaml, this.fileName, locatorItem);
      } else if (_executionContext.mode === "MOBILE") {
        const steps = new MobileSteps(this.driver);
        const locator = await steps.resolveLocator(locatorItem);
        await steps.execute(action, locator, result.value, elementId, this.dataYaml, this.fileName, locatorItem);
      } else {
        throw new Error(`Unsupported mode: ${_executionContext.mode}`);
      }
      value = result.found ? "***" : result.value; // Mask value in logs if it's from env variable

      //  Log success message
      console.log(
        chalk.green(
          `✅ Action "${action}" with value "${value}" performed on element "${elementId}" successfully.`,
        ),
      );
    } catch (error) {
      // 5️⃣ Catch and display any runtime errors
      console.error(
        chalk.red(
          `❌ Error performing action "${action}" on element "${elementId}": ${error.message}`,
        ),
      );
      console.error(chalk.gray(error.stack));
      throw error; // Re-throw error so Cucumber marks the step as failed
    }
  },
);
Then("I verify title this page is {string}", async function (expectedTitle) {
  try {
    // Wait for the page to load
    const steps = new WebSteps(this.page);
    console.log("Waiting for the page to load...");
    await pageFixture.getPageFixture().waitForLoadState("load");

    // Get the actual title of the page
    const actualTitle = await pageFixture.getPageFixture().title();
    console.log(
      `Verifying page title. Expected: "${expectedTitle}", Actual: "${actualTitle}"`,
    );

    // Assert the title matches the expected value
    steps.execute("VERIFY TITLE", null, expectedTitle);
    expect(actualTitle).toBe(expectedTitle);

    console.log("Page title verification successful.");
  } catch (error) {
    console.error(
      `Error during title verification. Expected: "${expectedTitle}":`,
      error.message,
    );
    console.error("Stack trace:", error.stack);
    throw error; // Re-throw the error to mark the step as failed
  }
});
Then(
  "I wait for element {word} to be {word}",
  async function (elementId, status) {
    try {
      const _executionContext = ManageMode.getExecutionContext();
      const locatorItem = await manageYamlFile.lookUpElementInYaml(
        elementId,
        this.dataYaml,
        _executionContext.device,
      );

      if (_executionContext.mode === "DESKTOP") {
        const steps = new WebSteps(this.page);
        const locator = await steps.resolveLocator(locatorItem);
        try {
          await steps.waitForStatus(
            locator,
            status,
            locatorItem.timeout ? locatorItem.timeout : pageFixture.getTimeout(),
            500,
            1,
            elementId,
            this.dataYaml,
            this.fileName,
            locatorItem,
          );
        } catch (error) {
          console.error(
            chalk.red(
              `Error waiting for status ${status} on locator ${JSON.stringify(locator)}: ${error.message}`,
            ),
          );
          console.error(chalk.gray(error.stack));
        }
      } else if (_executionContext.mode === "MOBILE") {
        const steps = new MobileSteps(this.driver);
        const locator = await steps.resolveLocator(locatorItem);
        await steps.waitForStatus(
          locator,
          status,
          locatorItem.timeout ? locatorItem.timeout : pageFixture.getTimeout(),
          500,
          1,
          elementId,
          this.dataYaml,
          this.fileName,
          locatorItem,
        );
      } else {
        throw new Error(`Unsupported mode: ${_executionContext.mode}`);
      }
    } catch (error) {
      console.error(
        `Error in step 'I wait for element ${elementId} to be ${status}':`,
        error.message,
      );
      throw error;
    }
  },
);
// function updateLocatorById(data, elementId, device, newLocator) {
//   const element = data.elements.find((el) => el.id === elementId);
//   if (!element) return false;

//   const index = element.locators.findIndex((l) => l.device === device);

//   if (index !== -1) {
//     element.locators[index] = newLocator; // replace
//   } else {
//     element.locators.push(newLocator); // add
//   }

//   return true;
// }
async function getNewLocatorFromAI(locator, message, page, steps) {
  if (!self_healing.isSelfHealingAvailable()) {
    console.log(chalk.yellow('Ollama is unavailable. Skipping self-healing.'));
    return null;
  }

  console.log(
    chalk.yellow(
      `Attempting self-healing for locator ${JSON.stringify(locator)}...`,
    ),
  );

  try {
    // generateLocator(html, log_error, path_image, bdd_step, original_selector, selector_map)
    const newLocator = await self_healing.generateLocatorFromAI(message, page, locator);

    console.log(
      chalk.green(
        `Self-healing successful. Raw AI locator: ${JSON.stringify(newLocator)}`,
      ),
    );

    // Resolve the AI-proposed locator into the framework's locator format
    const resolvedLocator = await steps.resolveLocator(newLocator);
    return resolvedLocator;
  } catch (healError) {
    console.error(chalk.red(`Self-healing failed: ${healError.message}`));
    return null;
  }
}

