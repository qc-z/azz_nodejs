'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var beautyProjectSchema = require('../schemas/beautyProject')
var BeautyProject = mongoose.model('BeautyProject', beautyProjectSchema)

BeautyProject = Promise.promisifyAll(BeautyProject)
Promise.promisifyAll(BeautyProject.prototype)

module.exports = BeautyProject



