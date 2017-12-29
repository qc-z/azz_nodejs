'use strict'

var mongoose = require('mongoose')
var RedpackSchema = require('../schemas/redpack')
var Redpack = mongoose.model('Redpack', RedpackSchema)

module.exports = Redpack