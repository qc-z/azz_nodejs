'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var StarSchema = require('../schemas/star')
var autoinc = require('../libs/mongoose-id-autoinc')

StarSchema.plugin(autoinc.plugin, {
  model: 'Star',
  field: 'star_id',
  start: 235,
  step: 1,
  once: 1
})

var Star = mongoose.model('Star', StarSchema)

Star = Promise.promisifyAll(Star)
Promise.promisifyAll(Star.prototype)

module.exports = Star
