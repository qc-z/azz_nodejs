'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var CouponSchema = require('../schemas/coupon')
var Coupon = mongoose.model('Coupon', CouponSchema)

Coupon = Promise.promisifyAll(Coupon)
Promise.promisifyAll(Coupon.prototype)

module.exports = Coupon



