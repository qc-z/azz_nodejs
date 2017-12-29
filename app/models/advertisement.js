'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var AdvertisementSchema = require('../schemas/advertisement')
var Advertisement = mongoose.model('Advertisement', AdvertisementSchema)

Advertisement = Promise.promisifyAll(Advertisement)
Promise.promisifyAll(Advertisement.prototype)
module.exports = Advertisement
