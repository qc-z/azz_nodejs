
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

/**
 * Project Schema
 */
var gameSchema = new Schema({
    clientId: {type: ObjectId, ref: 'Client'},
    userId: {type: ObjectId, ref: 'User'},
    gameid: String,
    category: String,
    done: {
    	type: String,
    	default: 'no'
    },
    id: String,
    title: String,
    img: String,
    des: String,
    prob: Number,
    area: String,
    code: String,
    openid: String,
    mobile: String,
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


gameSchema.pre('save', function(next) {
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

module.exports = gameSchema
