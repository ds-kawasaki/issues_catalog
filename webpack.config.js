const path = require('path');

module.exports = {
  entry: {
    main: './front_src/javascripts/main.js',
    settings: './front_src/javascripts/settings.js',
  },
  output: {
    path: path.resolve(__dirname, 'assets/javascripts'),
    filename: '[name].js'
  }
}