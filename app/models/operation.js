'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var OperationSchema = require('../schemas/operation')
var Operation = mongoose.model('Operation', OperationSchema)

Operation = Promise.promisifyAll(Operation)
Promise.promisifyAll(Operation.prototype)

module.exports = Operation



