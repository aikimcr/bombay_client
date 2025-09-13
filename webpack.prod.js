const { merge } = require('webpack-merge');
const Dotenv = require('dotenv-webpack');
const common = require('./webpack.base.js');

module.exports = merge(common, {
  mode: 'production',
  output: {
    publicPath: '/bombay_client',
  },
  plugins: [
    new Dotenv({
      path: '.env.production',
      safe: true,
    }),
  ],
});
