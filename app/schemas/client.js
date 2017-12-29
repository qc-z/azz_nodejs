'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
// var ObjectId = Schema.Types.ObjectId
var bcrypt = require('bcryptjs')
var SALT_WORK_FACTOR = 10
var Mixed = Schema.Types.Mixed

/**
 * Face Schema
 */

var ClientSchema = new Schema({
  username: String,
  name: String,
  uuid: String,
  role: {
    type: Number,
    default: 10
  },
  level: {
  	type: Number,
  	default: 0
  },
  ad: Mixed,
  video: Mixed,
  carousel: Mixed,
  optTool: String,
  mobile: String,
  phoneNumber: String,
  shareFaceUrl: String,
  shareSkinUrl: String,
  shareStarUrl: String,
  openId: String,
  salesId: String,
  shopName: String,
  shopAddr: String,
  avatar: String,
  qrcode: String,
  logo: String,
  password: String,
  recommenditem: Mixed,
  customerInfo: String,
  deviceId: [String],
  deviceLimit: {
  	type: Number,
  	default: 5
  },
  customerAd: Mixed,
  autoReply: String,
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

ClientSchema.pre('save', function(next) {
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


ClientSchema.pre('save', function(next) {
  var client = this

  // if (authTypes.indexOf(this.provider) !== -1) {
  //   return next(new Error('Invalid password'))
  // }
  if (!client.isModified('password')) return next()

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err)
    bcrypt.hash(client.password, salt, function(error, hash) {
      if (error) return next(error)

      client.password = hash
      next()
    })
  })
})

/**
 * Methods
 */
ClientSchema.methods = {

  comparePassword: function(_password, password) {
    return function(cb) {
      bcrypt.compare(_password, password, function(err, isMatch) {
        cb(err, isMatch)
      })
    }
  }
}



module.exports = ClientSchema

