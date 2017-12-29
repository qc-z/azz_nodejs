'use strict'

var mongoose = require('mongoose')
// var bcrypt = require('bcryptjs')
// var SALT_WORK_FACTOR = 10
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId


/**
 * StarMember Schema
 */
var Template = new Schema({
  adType: String,
  topImg: String,
  coupons:[],
  products:[],
  clientId: String,
  sysMemberId: String,
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})


Template.pre('save', function(next) {
  if (this.isNew) {
    if (!this.meta.createdAt) {
      this.meta.createdAt = this.meta.updatedAt = Date.now()
    }
  }
  else {
    this.meta.updatedAt = Date.now()
  }
  next()
})

module.exports = Template

