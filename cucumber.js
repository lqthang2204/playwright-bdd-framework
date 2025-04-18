const path = require('path');
const config = require(path.resolve(__dirname, './config.json'));
// const { config } = require('./support/world'); // Import config from world.js
module.exports = {
  default: {
    paths: ['src/test/features/**/*.feature'],
    require: [
      'src/test/step-definitions/**/*.js',
      'support/**/*.js'
    ],
    format: [
      'progress',// Always show progress in the terminal
      ...(config.is_generate_report?[ 
        'json:./reports/cucumber_report.json', // JSON report output
        'html:./reports/cucumber_report.html'  // HTML report output]) 
] : [])
    ],
    parallel: 2,
    encoding: 'utf-8'
  }
};