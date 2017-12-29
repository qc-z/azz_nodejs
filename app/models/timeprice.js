'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var TimepriceSchema = require('../schemas/timeprice')
var Timeprice = mongoose.model('Timeprice', TimepriceSchema)

Timeprice = Promise.promisifyAll(Timeprice)
Promise.promisifyAll(Timeprice.prototype)

module.exports = Timeprice



