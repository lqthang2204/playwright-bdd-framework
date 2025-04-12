module.exports = {
  default: {
    paths: ['src/test/features/*.feature'],
    require: [
      'src/test/step-definitions/**/*.js',
      'support/**/*.js'
    ],
    format: ['progress'],
    parallel: 2
  }
};