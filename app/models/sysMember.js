'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var SysMemberSchema = require('../schemas/sys-member')
var SysMember = mongoose.model('SysMember', SysMemberSchema)

SysMember = Promise.promisifyAll(SysMember)
Promise.promisifyAll(SysMember.prototype)
module.exports = SysMember
