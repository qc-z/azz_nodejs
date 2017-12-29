'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var Mixed = Schema.Types.Mixed

/**
 * Eyebrow Schema
 */

var EyebrowSchema = new Schema({
  clientId: {type: ObjectId, ref: 'Client'},
  userId: {type: ObjectId, ref: 'User'},
  uuid: String,
  testTimes: {
    type: Number,
    default: 1
  },
  originType: String,
  improPic: String,
  province: String,
  city: String,
  loc: String,
  mobile: String,
  shareUrl: String,
  eyebrowArr: [],
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

EyebrowSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  }
  else {
    this.meta.updatedAt = Date.now()
  }

  if (!this.cover && this.photos && this.photos[0]) {
    this.cover = this.photos[0]
  }

  next()
})

module.exports = EyebrowSchema

