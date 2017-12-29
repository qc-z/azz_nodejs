'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var StartestSchema = require('../schemas/startest')
var Startest = mongoose.model('Startest', StartestSchema)

Startest = Promise.promisifyAll(Startest)
Promise.promisifyAll(Startest.prototype)
module.exports = Startest
