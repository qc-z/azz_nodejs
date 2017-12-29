'use strict'

var mongoose = require('mongoose')
// var authTypes = ['twitter', 'facebook', 'weibo']
var bcrypt = require('bcryptjs')
var SALT_WORK_FACTOR = 10
var Schema = mongoose.Schema
// var ObjectId = Schema.Types.ObjectId

/**
 * SysMember Schema
 */

var SysMember = new Schema({
  username: String,
  password: String,
  mobile: String,
  email: String,
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


SysMember.pre('save', function(next) {
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
SysMember.pre('save', function(next) {
  var user = this

  if (user.username && !user.name) {
    user.name = user.username
  }

  if (user.name.indexOf('arpt') === 0) {
    user.name = user.name.replace('arpt', '$')
  }

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
SysMember.methods = {

  comparePassword: function(_password, password) {
    return function(cb) {
      bcrypt.compare(_password, password, function(err, isMatch) {
        cb(err, isMatch)
      })
    }
  }
}

module.exports = SysMember

