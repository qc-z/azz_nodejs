'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var FaceSetSchema = require('../schemas/faceSet')

var autoinc = require('../libs/mongoose-id-autoinc')

FaceSetSchema.plugin(autoinc.plugin, {
  model: 'FaceSet',
  field: 'Faceset_no',
  start: 1,
  step: 1,
  once: 1
})

var FaceSet = mongoose.model('FaceSet', FaceSetSchema)

FaceSet = Promise.promisifyAll(FaceSet)
Promise.promisifyAll(FaceSet.prototype)

module.exports = FaceSet
