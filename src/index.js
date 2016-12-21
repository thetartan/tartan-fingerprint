'use strict';

var _ = require('lodash');
var tartan = require('tartan');

_.extend(module.exports, require('./@package'));

module.exports.fingerprint = require('./fingerprint');

tartan.fingerprint = module.exports.fingerprint;
