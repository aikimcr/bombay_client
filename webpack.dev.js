// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { merge } = require('webpack-merge');
const common = require('./webpack.base.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: './dist',
    },
    historyApiFallback: true,
    allowedHosts: 'all',
    port: 3000,
  },
  // disable unless bundle needs to be analyzed
  // plugins: [
  //   new BundleAnalyzerPlugin({
  //       analyzerMode: 'static',
  //   }),
  // ],
});
