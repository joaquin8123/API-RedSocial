'use strict'

var mongoose = require('mongoose')
var schema = mongoose.Schema

var UserSchema = schema({
    name: String,
    surname: String,
    nick: String,
    email: String,
    password: String,
    roles: String,
    image: String
})

module.exports = mongoose.model('User', UserSchema)