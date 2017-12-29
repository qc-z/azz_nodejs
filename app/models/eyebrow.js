'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var EyebrowSchema = require('../schemas/eyebrow')
var Eyebrow = mongoose.model('Eyebrow', EyebrowSchema)

Eyebrow = Promise.promisifyAll(Eyebrow)
Promise.promisifyAll(Eyebrow.prototype)
module.exports = Eyebrow
