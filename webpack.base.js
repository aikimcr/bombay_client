const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const buildPath = path.resolve(__dirname, 'dist');
const Dotenv = require('dotenv-webpack');

const pluginsData = [
  new HtmlWebpackPlugin({
    template: './src/index.html',
    inject: true,
    chunks: ['index'],
    filename: 'index.html',
  }),
  new CopyPlugin({
    patterns: [{ from: path.resolve(__dirname, 'static'), to: './static' }],
  }),
];

module.exports = {
  devtool: 'source-map',
  entry: {
    index: './src/index.jsx',
  },
  experiments: {
    css: false,
  },
  output: {
    filename: '[name].js',
    path: buildPath,
    clean: true, // optional: cleans old builds
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      dist: path.join(__dirname, './dist'),
      src: path.join(__dirname, './src'),
      public: path.join(__dirname, './public'),
      styles: path.resolve(__dirname, './src/utils/styles'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        enforce: 'pre',
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
          plugins: ['@babel/plugin-proposal-class-properties'],
        },
      },
      {
        test: /\.(scss|css)$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              api: 'modern-compiler',
            },
          },
        ],
      },
    ],
  },
  plugins: pluginsData,
};
