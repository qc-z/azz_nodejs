'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var SkinSchema = require('../schemas/skin')
var Skin = mongoose.model('Skin', SkinSchema)

Skin = Promise.promisifyAll(Skin)
Promise.promisifyAll(Skin.prototype)
module.exports = Skin
