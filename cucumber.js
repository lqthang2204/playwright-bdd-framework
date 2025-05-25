const path = require('path');
const config = require(path.resolve(__dirname, './config.json'));
// const { config } = require('./support/world'); // Import config from world.js
module.exports = {
  default: {
    parallel: config.parallel, // Run tests with 2 workers
    paths: ['src/test/features/**/*.feature'],
    require: [
      'src/test/step-definitions/**/*.js',
      'support/**/hooks.js',
      'support/**/world.js'
    ],
    format: [
      'progress-bar',
      ...(config.is_generate_report
        ? [
            // 'html:./reports/multi-report/cucumber_report.html',
            'json:./reports/multi-report/cucumber_report.json'
          ]
        : [])
    ],
    encoding: 'utf-8'
  }
};