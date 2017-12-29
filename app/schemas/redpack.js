'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var Mixed = Schema.Types.Mixed

/**
 * Code Schema
 */

var RedpackSchema = new Schema({
  openid: String,
  name: String,
  send: {
    type: String,
    default: 'no'
  },
  reason: String,
  amount: Number,
  mobile: String,
  meta: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
})

RedpackSchema.pre('save', function(next) {
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

module.exports = RedpackSchema
