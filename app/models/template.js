'use strict'

var mongoose = require('mongoose')
var Promise = require('bluebird')
var TemplateSchema = require('../schemas/template')
var Template = mongoose.model('Template', TemplateSchema)

Template = Promise.promisifyAll(Template)
Promise.promisifyAll(Template.prototype)
module.exports = Template
