'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

/**
 * Faceset Schema
 */

var FacesetSchema = new Schema({
	faceset_no: {
    type: Number,
    required: true,
    default: 1
  },
	faceset_token: String,
  display_name: String,
  name: String,
  sex: Number,
  faceCount: {
    type: Number,
    default: 0
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

FacesetSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  }
  else {
    this.meta.updatedAt = Date.now()
  }
  next()
})

module.exports = FacesetSchema

