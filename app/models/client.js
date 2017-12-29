'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var ClientSchema = require('../schemas/client')
var Client = mongoose.model('Client', ClientSchema)

Client = Promise.promisifyAll(Client)
Promise.promisifyAll(Client.prototype)

module.exports = Client
