'use strict'

var mongoose = require('mongoose')
// var bcrypt = require('bcryptjs')
// var SALT_WORK_FACTOR = 10
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId


/**
 * StarMember Schema
 */
var Advertisement = new Schema({
  adType: String,
  videoUrl: String,
  smallVideoUrl: String,
  imgUrl: String,
  imgArr:[],
  preImg: String,
  des: String,
  area: String,
  adUrl: String,
  cilentId: {type: ObjectId, ref: 'Cilent'},
  sysMemberId: {type: ObjectId, ref: 'SysMember'},
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


Advertisement.pre('save', function(next) {
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

module.exports = Advertisement

