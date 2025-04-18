const { Before, After, BeforeAll } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');

// const screenshotsDir = path.resolve(__dirname, '../../reports/screenshots');

// BeforeAll(() => {
//   if (fs.existsSync(screenshotsDir)) {
//     fs.readdirSync(screenshotsDir).forEach(file => {
//       const filePath = path.join(screenshotsDir, file);
//       fs.unlinkSync(filePath); // Delete each file
//     });
//     console.log('Cleared screenshots directory.');
//   }
// });

Before(async function () {
  // Launch the browser before each scenario
  await this.launchBrowser(); // from CustomWorld
});

After(async function (scenario) {
  if (scenario.result?.status === 'FAILED') {
    // Define the screenshot path
    const screenshotPath = path.resolve(
      __dirname,
      `../../reports/screenshots/${scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`
    );

    // Take a screenshot and save it to the specified path
    await this.page.screenshot({ path: screenshotPath });

    // Attach the screenshot to the Cucumber report
    const screenshotData = fs.readFileSync(screenshotPath); // Read the file from the path
    this.attach(screenshotData, 'image/png'); // Attach the screenshot to the report

    console.log(`Screenshot saved at: ${screenshotPath}`);
  }

  // Close the browser after each scenario
  await this.closeBrowser(); // from CustomWorld
});