const { execSync } = require("child_process");
const path = require("path");
const config = require(path.resolve(__dirname, "./config.json"));
const fs = require("fs");

console.log("Running tests with the following configuration:");

// Paths
const reportPathJson = path.resolve(__dirname, "./reports/multi-report/cucumber_report.json");
const reportPathHtml = path.resolve(__dirname, "./reports/multi-report/index.html");
const reportFeatureFolder = path.resolve(__dirname, "./reports/multi-report/features/");
const screenshots = path.resolve(__dirname, "./reports/screenshots");
// Delete the files if they exist
[reportPathJson, reportPathHtml, reportFeatureFolder, screenshots].forEach(deleteFile);

// Determine feature folder based on mode
let featureFolder = "/Users/lequangthang/Playwright-workspace/playwright-bdd-framework/src/test/features/";
if (config.mode === "mobile") {
    featureFolder = featureFolder +"mobile/";
} else if (config.mode === "desktop") {
    featureFolder = featureFolder+"desktop/";
}

// Get tags from the environment variable or fallback to config.json
const tags = process.env.TAGS || config.tags;

// Build the command to run cucumber-js'
let command;
if (!tags) {
    console.warn("No tags provided, running all feature files.");
    command = `cucumber-js ${featureFolder}`;
} else {
    console.log("Using tags:", tags);
    command = `cucumber-js ${featureFolder} --tags "${tags}"`;
}

const command_posttest = 'node support/report_chart.js';

console.log(`Running: ${command}`);

try {
    // Execute the command
    execSync(command, { stdio: "inherit" });
} catch (error) {
    console.error("Error running tests:", error.message);
}

// Conditionally run the posttest script
if (config.is_generate_report) {
    console.log("is_generate_report is true. Running posttest...");
    try {
        console.log(`Running: ${command_posttest}`);
        execSync(command_posttest, { stdio: "inherit" }); // Run the posttest script to generate the report
    } catch (error) {
        console.error("Error generating report:", error.message);
        process.exit(1); // Exit with failure code
    }
} else {
    console.log("is_generate_report is false. Skipping posttest...");
}

function deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if(stats.isDirectory){
            try {
                fs.rmSync(filePath, { recursive: true, force: true });
                console.log("Directory deleted successfully:", filePath);
            }
            catch (err) {
                console.error("Error deleting directory:", err);
            }
        }
        else{
            console.log("Report file exists:", filePath);
            // Delete the file
            try {
                fs.unlinkSync(filePath);
                console.log("File deleted successfully:", filePath);
            } catch (err) {
                console.error("Error deleting file:", err);
            }
        }
        
    } else {
        console.log("File does not exist:", filePath);
    }
}