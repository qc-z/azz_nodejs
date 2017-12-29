'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var PriceSchema = require('../schemas/price')
var Price = mongoose.model('Price', PriceSchema)

Price = Promise.promisifyAll(Price)
Promise.promisifyAll(Price.prototype)

module.exports = Price



