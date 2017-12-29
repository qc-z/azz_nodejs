'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var Mixed = Schema.Types.Mixed

/**
 * Skin Schema
 */

var SkinSchema = new Schema({
  clientId: {type: ObjectId, ref: 'Client'},
  userId: {type: ObjectId, ref: 'User'},
  uuid: String,
  testTimes: {
    type: Number,
    default: 1
  },
  originType: String,
  image_path: String,
  province: String,
  city: String,
  loc: String,
  mobile: String,
  shareUrl: String,
  water_flag: Mixed, // 水分0
  inflammation_flag: Mixed, // 炎症（无、轻微、中、严重）数组对象
  wrinkles_flag: Mixed, // 皱纹（鱼尾纹、法令纹、川字纹）数组对象
  color_flag: Mixed, // 肤色0
  oil_flag: Mixed, // 油份0
  prose_flag: Mixed, // 毛孔（小，中，大）数组对象
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

SkinSchema.pre('save', function(next) {
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

module.exports = SkinSchema

