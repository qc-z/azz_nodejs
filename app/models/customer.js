'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var CustomerSchema = require('../schemas/customer')
var Customer = mongoose.model('Customer', CustomerSchema)


Customer = Promise.promisifyAll(Customer)
Promise.promisifyAll(Customer.prototype)
module.exports = Customer
