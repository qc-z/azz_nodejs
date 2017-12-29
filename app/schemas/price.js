
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

/**
 * Project Schema
 */
var priceSchema = new Schema({
    clientId: {type: ObjectId, ref: 'Client'},
    id: String,
    region: String,
    high: String,
    low: String,
    average: String,
    deal: String,
    name: String,
    meta: {
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }
})


priceSchema.pre('save', function(next) {
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

module.exports = priceSchema
