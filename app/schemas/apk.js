'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var Mixed = Schema.Types.Mixed

/**
 * Code Schema
 */

var ApkSchema = new Schema({
  //唯一id，表示每个发行版本的唯一id
  id: String,
  //版本号
  versionName: String,
  //版本更新次数
  versionCode: Number,
  //下载地址
  download: String,
  //是否强制更新
  updateHard: String,
  // 设备是 pc 或者 app
  device: String,
  type: String,
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

ApkSchema.pre('save', function(next) {
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

module.exports = ApkSchema
