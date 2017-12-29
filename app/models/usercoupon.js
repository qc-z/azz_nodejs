'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var UsercouponSchema = require('../schemas/usercoupon')
var Usercoupon = mongoose.model('Usercoupon', UsercouponSchema)


Usercoupon = Promise.promisifyAll(Usercoupon)
Promise.promisifyAll(Usercoupon.prototype)
module.exports = Usercoupon
