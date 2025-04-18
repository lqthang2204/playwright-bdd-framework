module.exports = {
  default: {
    paths: ['src/test/features/**/*.feature'],
    require: [
      'src/test/step-definitions/**/*.js',
      'support/**/*.js'
    ],
    format: [
      'json:./reports/cucumber_report.json', // JSON report output
      'html:./reports/cucumber_report.html'  // HTML report output
    ],
    parallel: 2,
    encoding: 'utf-8'
  }
};