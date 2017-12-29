'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var StarMemberSchema = require('../schemas/star-member')
var StarMember = mongoose.model('StarMember', StarMemberSchema)

StarMember = Promise.promisifyAll(StarMember)
Promise.promisifyAll(StarMember.prototype)
module.exports = StarMember
