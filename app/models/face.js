'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var FaceSchema = require('../schemas/face')
var Face = mongoose.model('Face', FaceSchema)

Face = Promise.promisifyAll(Face)
Promise.promisifyAll(Face.prototype)

module.exports = Face
