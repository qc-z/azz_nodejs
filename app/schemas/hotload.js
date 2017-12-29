'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
// var ObjectId = Schema.Types.ObjectId
// var Mixed = Schema.Types.Mixed

/**
 * Code Schema
 */

var HotloadSchema = new Schema({
  resName: String,
  version: String,
  resUrl: String,
  resType: String,
  device: String,
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

HotloadSchema.pre('save', function(next) {
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

module.exports = HotloadSchema
