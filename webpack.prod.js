const { merge } = require('webpack-merge');
const common = require('./webpack.base.js');

module.exports = merge(common, {
  mode: 'production',
  output: {
    publicPath: '/bombay_client',
  },
});
