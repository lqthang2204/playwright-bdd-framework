const path = require('path');
const config = require(path.resolve(__dirname, './config.json'));
// const { config } = require('./support/world'); // Import config from world.js
module.exports = {
  default: {
    parallel: config.parallel, // Run tests with 2 workers
    paths: ['src/test/features/**/*.feature'],
    require: [
      'src/test/step-definitions/**/*.js',
      'support/**/*.js'
    ],
    format: [
      'progress',
      ...(config.is_generate_report
        ? [
            'json:./reports/cucumber_report.json',
            'html:./reports/cucumber_report.html'
          ]
        : [])
    ],
    encoding: 'utf-8'
  }
};