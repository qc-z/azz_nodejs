'use strict'

var mongoose = require('mongoose')
// var authTypes = ['twitter', 'facebook', 'weibo']
var bcrypt = require('bcryptjs')
var SALT_WORK_FACTOR = 10
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

/**
 * User Schema
 */

var UserSchema = new Schema({
  openid: String,
  rangeNum: Number,
  nickname: String,
  sex: String,
  province: String,
  city: String,
  country: String,
  headimgurl: String,
  language: String,
  privilege: [],
  unionid: String,
  uuid: String,
  mobile: String,
  username: String,
  password: String,
  fatherOpenid: String,
  type: String,
  remark: String,
  cilentId: {type: ObjectId, ref: 'Cilent'},
  skinTestId: {type: ObjectId, ref: 'SkinTest'},
  faceTestId: {type: ObjectId, ref: 'FaseTest'},
  starTestId: {type: ObjectId, ref: 'StarTest'},
  location: String,
  role: {
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

/**
 * Virtuals
 */

UserSchema.virtual('token').get(function() {
  var salt = bcrypt.genSaltSync(10)
  var token = bcrypt.hashSync(String(this._id), salt)

  return token
})

UserSchema.pre('save', function(next) {
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
UserSchema.pre('save', function(next) {
  var user = this

  // if (authTypes.indexOf(this.provider) !== -1) {
  //   return next(new Error('Invalid password'))
  // }
  if (!user.isModified('password')) return next()

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, function(error, hash) {
      if (error) return next(error)

      user.password = hash
      next()
    })
  })
})


/**
 * Methods
 */
UserSchema.methods = {

  comparePassword: function(_password, password) {
    return function(cb) {
      bcrypt.compare(_password, password, function(err, isMatch) {
        cb(err, isMatch)
      })
    }
  }
}

module.exports = UserSchema
