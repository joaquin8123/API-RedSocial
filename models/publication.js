'use strict'

var mongoose = require('mongoose')
var schema = mongoose.Schema

var PublicationSchema = schema({
    text: String,
    file: String,
    created_at: String,
    user: {type: schema.ObjectId, ref: 'User'}
})

module.exports = mongoose.model('Publication', PublicationSchema)