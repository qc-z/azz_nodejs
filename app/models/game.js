'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var GameSchema = require('../schemas/game')
var Game = mongoose.model('Game', GameSchema)

Game = Promise.promisifyAll(Game)
Promise.promisifyAll(Game.prototype)

module.exports = Game



