const fs = require("fs");
const path = require("path");

// Function to build the email HTML
function buildEmailHTML({ total, passed, failed, duration, date, reportLink }) {
  let template = fs.readFileSync("./Template/index.html", "utf-8");

  return template
    .replace("{{total}}", total)
    .replace("{{passed}}", passed)
    .replace("{{failed}}", failed)
    .replace("{{duration}}", duration)
    .replace("{{date}}", date)
    .replace("{{reportLink}}", reportLink || "#");
}

// Function to extract data from the Cucumber JSON report
function extractCucumberReportData(reportPath) {
  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));

  let total = 0;
  let passed = 0;
  let failed = 0;
  let duration = 0;

  report.forEach((feature) => {
    feature.elements.forEach((scenario) => {
      total++;
      const scenarioStatus = scenario.steps.every((step) => step.result.status === "passed")
        ? "passed"
        : "failed";

      if (scenarioStatus === "passed") {
        passed++;
      } else {
        failed++;
      }

      // Add scenario duration (if available)
      scenario.steps.forEach((step) => {
        if (step.result.duration) {
          duration += step.result.duration; // Duration is in nanoseconds
        }
      });
    });
  });

  // Convert duration from nanoseconds to seconds
  duration = `${(duration / 1e9).toFixed(2)}s`;

  return { total, passed, failed, duration };
}

// Main function to generate the email HTML
function generateEmailHTML(reportPath, reportLink) {
  // Extract data from the Cucumber report
  const { total, passed, failed, duration } = extractCucumberReportData(reportPath);

  // Build the email HTML
  const emailHTML = buildEmailHTML({
    total,
    passed,
    failed,
    duration,
    date: new Date().toLocaleString(),
    reportLink,
  });

  // Save the generated HTML to a file (optional)
  const outputPath = "./Template/generated_email.html";
  fs.writeFileSync(outputPath, emailHTML, "utf-8");
  console.log("Email HTML generated successfully at:", outputPath);

  return emailHTML; // Return the generated HTML
}

module.exports = { generateEmailHTML };