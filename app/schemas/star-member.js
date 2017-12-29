'use strict'

var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')
var SALT_WORK_FACTOR = 10
var Schema = mongoose.Schema


/**
 * StarMember Schema
 */
var StarMember = new Schema({
  username: String,
  password: String,
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


StarMember.pre('save', function(next) {
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
StarMember.pre('save', function(next) {
  var user = this

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
StarMember.methods = {

    comparePassword: function(_password, password) {
        return function(cb) {
            bcrypt.compare(_password, password, function(err, isMatch) {
                cb(err, isMatch)
            })
        }
    }
}



module.exports = StarMember

