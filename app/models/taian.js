'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var TaianSchema = require('../schemas/taian')
var Taian = mongoose.model('Taian', TaianSchema)


Taian = Promise.promisifyAll(Taian)
Promise.promisifyAll(Taian.prototype)
module.exports = Taian
