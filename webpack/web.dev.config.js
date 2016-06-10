//------------------------------------------------------------------------------
// Copyright IBM Corp. 2016
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    path.join(__dirname, '../client/main'),
  ],
  output: {
    path: path.join(__dirname, '../public'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    loaders: [
      { test: /\.svg$/, loader: 'raw'},
      // take all less files, compile them, and bundle them in with our js bundle
      { test: /\.less$/, loader: 'style!css!postcss!less' },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react'],
          plugins: [['react-transform', {
            transforms: [{
              transform: 'react-transform-hmr',
              imports: ['react'],
              // this is important for Webpack HMR:
              locals: ['module']
            }, {
              transform: 'react-transform-catch-errors',
              imports: ['react', 'redbox-react'],
            }]
          }]],
        },
      },
    ],
  },
  postcss: () => [autoprefixer({ browsers: ['last 2 versions'] })],
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
};
