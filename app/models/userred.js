'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var UserredSchema = require('../schemas/userred')
var Userred = mongoose.model('Userred', UserredSchema)


Userred = Promise.promisifyAll(Userred)
Promise.promisifyAll(Userred.prototype)
module.exports = Userred
