const path = require('path');
// const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');

const config = {
  context: __dirname,
  entry: './assets/js/index.js',
  output: {
    path: path.resolve(__dirname, './assets/bundles'),
    // filename: 'app.js',
    filename: '[name]-[hash].js',
  },
  plugins: [
    new BundleTracker({ filename: './trolley/webpack-stats.json' }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
          },
        },
      },
    ],
  },
};

module.exports = config;
/*
module.exports = {

  context: __dirname,

  entry: './assets/js/index', // entry point of our app. assets/js/index.js should require other js modules and dependencies it needs

  output: {
      path: path.resolve('./assets/bundles/'),
      filename: "[name]-[hash].js",
  },

  plugins: [
    new BundleTracker({filename: './webpack-stats.json'}),
  ],

  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader'}, // to transform JSX into JS
    ],
  },

  resolve: {
    modulesDirectories: ['node_modules', 'bower_components'],
    extensions: ['', '.js', '.jsx']
  },
}*/
