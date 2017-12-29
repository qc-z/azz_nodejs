'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var UserSchema = require('../schemas/user')
var User = mongoose.model('User', UserSchema)


User = Promise.promisifyAll(User)
Promise.promisifyAll(User.prototype)
module.exports = User
