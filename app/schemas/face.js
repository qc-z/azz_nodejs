'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var Mixed = Schema.Types.Mixed

/**
 * Face Schema
 */

var FaceSchema = new Schema({
  clientId: {type: ObjectId, ref: 'Client'},
  userId: {type: ObjectId, ref: 'User'},
  testTimes: {
    type: Number,
    default: 1
  },
  shareUrl: String,
  originType: String,
  looksTotalScore: Number, //面容总分
  face: Mixed, // face++原始数据
  image_path: String, // 图片路径
  ima_width: Number,// 对应图像宽度
  ima_height: Number, // 对应图像高度
  sKanXiang: Mixed, // 看相参数（对象，包含其他字段，详细看TestValue）
  kanXiangScore: Number, // 看相分数
  sOutLine: Mixed, // 轮廓参数（对象，包含其他字段，详细看TestValue）
  outLineScore: Number, // 轮廓评分
  sEyebrow: Mixed, // 眉参数（对象，包含其他字段，详细看TestValue
  eyebrowScore: Number, // 眉评分（对象，包含其他字段，详细看TestValue
  sEye: Mixed, // 眼参数（对象，包含其他字段，详细看TestValue）
  eyeScore: Number, // 眼评分
  sNose: Mixed, // 鼻参数（对象，包含其他字段，详细看TestValue）
  noseScore: Number, // 鼻评分
  sMouth: Mixed, // 口参数（对象，包含其他字段，详细看TestValue
  mouthScore: Number, // 口评分
  testValue: Mixed, // 面部测试数据
  uuid: String,
  mobile: String,
  province: String,
  loc: String,
  city: String,
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

FaceSchema.pre('save', function(next) {
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

module.exports = FaceSchema

