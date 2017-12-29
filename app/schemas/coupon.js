
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

/**
 * Project Schema
 */
var couponSchema = new Schema({
    clientId: {type: ObjectId, ref: 'Client'},
    userId: {type: ObjectId, ref: 'User'},
    id: String,
    title: String,
    des: String,
    img: String,
    category: String,
    prob: Number,
    area: String,
    code: String,
    price: String,
    dateStart: {
        type: Date
    },
    dateEnd: {
        type: Date
    },
    mobile: String,
    limit: String,
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


couponSchema.pre('save', function(next) {
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

module.exports = couponSchema
