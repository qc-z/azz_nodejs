
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

/**
 * Project Schema
 */
var operationSchema = new Schema({
    clientId: {type: ObjectId, ref: 'Client'},
    id: String,
    region: String,
    name:  String,
    parentid: String,
    price: String,
    time: String,
    method: String,
    introduction: String,
    effect: String,
    fitPeople: String,
    tabooPeople: String,
    advantage: String,
    weak: String,
    other: String,
    treatProcess: String,
    surgicalPre: String,
    surgicalCare: String,
    timeing: String,
    treatment: String,
    cover: String,
    risk: String,
    anesthesia: String,
    inhospital: String,
    collationschematic: [],
    operationProjectDatas: [],
    schematicschematic: [],
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


operationSchema.pre('save', function(next) {
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

module.exports = operationSchema
