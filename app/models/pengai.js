'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var PengaiSchema = require('../schemas/pengai')
var Pengai = mongoose.model('Pengai', PengaiSchema)


Pengai = Promise.promisifyAll(Pengai)
Promise.promisifyAll(Pengai.prototype)
module.exports = Pengai
