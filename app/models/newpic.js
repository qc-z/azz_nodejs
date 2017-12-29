'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var NewpicSchema = require('../schemas/newpic')
var Newpic = mongoose.model('Newpic', NewpicSchema)

Newpic = Promise.promisifyAll(Newpic)
Promise.promisifyAll(Newpic.prototype)
module.exports = Newpic
