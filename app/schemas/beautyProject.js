
var mongoose = require('mongoose')
var bcryptjs = require('bcryptjs')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

/**
 * Project Schema
 */
var BeautyProjectSchema = new Schema({
    projectType: String,
    projectName: String,
    projectPrice: String,
    area: String,
    typeName:String,
    clientId: {type: ObjectId, ref: 'Client'},
    meta: {
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }
})


BeautyProjectSchema.pre('save', function(next) {
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

module.exports = BeautyProjectSchema
