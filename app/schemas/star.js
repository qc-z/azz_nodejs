'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var Mixed = Schema.Types.Mixed
// var bcryptjs = require('bcryptjs')


/**
 * Star Schema
 */

var StarSchema = new Schema({
  faceset_token: String,
  star_id: {
    type: Number,
    default: 235
  },
  name: String,
  sex: Number,
  picture: String,
  introduction: String,
  face_token: String,
  country_id: Number,
  userid: String,
  extend: Mixed,
  country: Mixed,
  faceTest: Mixed,
  skinTest: Mixed,
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

StarSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  }
  else {
    this.meta.updatedAt = Date.now()
  }

  next()
})

module.exports = StarSchema

