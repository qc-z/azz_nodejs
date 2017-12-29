
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

/**
 * Project Schema
 */
var caseSchema = new Schema({
    clientId: {type: ObjectId, ref: 'Client'},
    id: String,
    part: String,
    title: String,
    des: String,
    before: String,
    after: String,
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


caseSchema.pre('save', function(next) {
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

module.exports = caseSchema
