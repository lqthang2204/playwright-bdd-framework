const report = require("multiple-cucumber-html-reporter");
const os = require("os");
const path = require('path');
const config = require(path.resolve(__dirname, '../config.json'));


const browserName = config.browser === "chromium" ? "chrome" : config.browser;
const device = config.mode === "mobile"
  ? (config.mobile && config.mobile.platformName ? config.mobile.platformName : "Mobile")
  : "Desktop";
report.generate({
  jsonDir: "reports/multi-report",
  reportPath: "reports/multi-report",
  metadata: {
    browser: {
      name: browserName,
      version: "60",
      
    },
    device: device,
    platform: {
      name: os.platform(),
      version: os.release(),
    },
  },
  customData: {
    title: "Run info",
    data: [
      { label: "Project", value: "Custom project" },
      { label: "Release", value: "1.2.3" },
      { label: "Cycle", value: "B11221.34321" },
      { label: "Execution Start Time", value: new Date().toLocaleString() },
      { label: "Execution End Time", value: new Date().toLocaleString() },
    ],
  },
});