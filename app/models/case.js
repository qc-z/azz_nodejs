'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var CaseSchema = require('../schemas/case')
var Case = mongoose.model('Case', CaseSchema)

Case = Promise.promisifyAll(Case)
Promise.promisifyAll(Case.prototype)

module.exports = Case



