'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
// var ObjectId = Schema.Types.ObjectId
var bcrypt = require('bcryptjs')
var SALT_WORK_FACTOR = 10
var Mixed = Schema.Types.Mixed

var CustomerSchema = new Schema({
  username: String, // 用户名称
  role: {	// 角色
    type: Number,
    default: 10
  },
  level: { // 是否VIP
  	type: Number,
  	default: 0
  },
  mobile: String,
  openId: String, // 微信推广ID
  salesId: String, // 销售员ID
  shopName: String, // 商店名称
  shopAddr: String, // 商店地址
  avartor: String, // 头像
  qrcode: String, // 公众号二维码
  logo: String, // 我的logo
  phoneNumber: String, // 客户电话
  username: String, // 用户名
  password: String, // 密码
  recommenditem: Mixed, // 推荐项目列表
  customerInfo: String, // 客户公司介绍
  deviceId: [String], // 设备机器吗
  deviceLimit: { // 设备数量
  	type: Number,
  	default: 2
  },
  customerAd: Mixed, // 公司公告
  autoReply: String, // 自动回复
  skinRole: {
    role: {
      type: Boolean,
      default: false
    },
    from: {
      type: Date,
      default: Date.now()
    },
    to: {
      type: Date,
      default: Date.now()
    }
  },
  faceRole: {
    role: {
      type: Boolean,
      default: false
    },
    from: {
      type: Date,
      default: Date.now()
    },
    to: {
      type: Date,
      default: Date.now()
    }
  },
  starRole: {
    role: {
      type: Boolean,
      default: false
    },
    from: {
      type: Date,
      default: Date.now()
    },
    to: {
      type: Date,
      default: Date.now()
    }
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

CustomerSchema.pre('save', function(next) {
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

/**
 * Pre-save hook
 */
CustomerSchema.pre('save', function(next) {
  var customer = this

  // if (authTypes.indexOf(this.provider) !== -1) {
  //   return next(new Error('Invalid password'))
  // }
  if (!customer.isModified('password')) return next()

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err)
    bcrypt.hash(customer.password, salt, function(error, hash) {
      if (error) return next(error)

      customer.password = hash
      next()
    })
  })
})

