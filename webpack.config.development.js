'use strict';

var _ = require('lodash');
var baseConfig = require('./webpack.config.base');

var developmentConfig = {
  output: {
    filename: 'tartan-fingerprint.js',
    path: './dist'
  }
};

var config = _.merge({}, baseConfig, developmentConfig);

module.exports = config;
