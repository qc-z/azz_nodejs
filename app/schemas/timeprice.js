
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

/**
 * Project Schema
 */
var timepriceSchema = new Schema({
    clientId: {type: ObjectId, ref: 'Client'},
    id: String,
    price: String,
    priceH: String,
    title: String,
    des: String,
    img: String,
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


timepriceSchema.pre('save', function(next) {
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

module.exports = timepriceSchema
