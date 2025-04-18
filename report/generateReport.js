// generateReport.js
const reporter = require('cucumber-html-reporter');
const path = require('path');
const config = require(path.resolve(__dirname, '../config.json'));
const runEnv = process.env.RUN_ENV || 'local'; // Default to 'local' if not set
const { generateEmailHTML } = require('./inject_template_report'); // Import the function

// npm install cucumber-html-reporter@5.5.0

if (!config.is_generate_report) {
    console.log("Report generation is turned OFF.");
    process.exit(0);
  }

const options = {
  theme: 'bootstrap', // Available themes: 'bootstrap', 'hierarchy', 'foundation', 'simple'
  jsonFile: 'reports/cucumber_report.json', // Path to the generated JSON file
  output: 'reports/cucumber_report.html',   // Output HTML file
  reportSuiteAsScenarios: true,             // Group by scenarios
  scenarioTimestamp: true,                  // Show timestamp for each scenario
  launchReport: true,                       // Automatically open the report in the browser
  metadata: {
    "App Version": "1.0.0",
    "Test Environment": config.env,
    "Browser": config.browser,
    "Platform": process.platform,
    "Executed": runEnv,
  }
};


reporter.generate(options);
if(config.is_send_email && config.is_generate_report) {
    const emailHTML = generateEmailHTML("./reports/cucumber_report.json", "./reports/cucumber_report.html"); // Generate the email HTML
    console.log("Email HTML generated successfully.");
//   const emailHTML = path.resolve(__dirname, '../Template/index.html');
//   const emailOptions = {
//     subject: `Cucumber Report - ${new Date().toLocaleString()}`,
//     body: emailHTML,
//     to: config.email.to,
//     from: config.email.from,
//     smtpConfig: config.email.smtpConfig,
//   };
//   sendEmail(emailOptions);
}
