'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var Mixed = Schema.Types.Mixed

/**
 * Startest Schema
 */

var StartestSchema = new Schema({
  clientId: {type: ObjectId, ref: 'Client'},
  userId: {type: ObjectId, ref: 'User'},
  uuid: String,
  province: String,
  city: String,
  loc: String,
  testTimes: {
    type: Number,
    default: 1
  },
  originType: String,
  image_path: String,
  mobile: String,
  shareUrl: String,
  sex: Number,
  country_id: Number,
  country: Mixed,
  faceTest: Mixed,
  skinTest: Mixed,
  starInfo: Mixed,
  search:{
    confidence: Number,
    face_token: String
  },
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

StartestSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  }
  else {
    this.meta.updatedAt = Date.now()
  }
  next()
})

module.exports = StartestSchema

