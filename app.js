'use strict'
// import modulos
var express = require('express')
var bodyParser = require('body-parser')
var user_routes = require('./routes/user.route')
var follow_routes = require('./routes/follow.route')
var publication_routes = require('./routes/publication.route')
var message_routes = require('./routes/message.route')
//var cors = require('cors')
var app = express()

//Middlewares
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//Routes
//app.use('api', user_routes)
app.use(user_routes)
app.use(follow_routes)
app.use(publication_routes)
app.use(message_routes)
//Cors
//app.use(cors())

//Exportar
module.exports = app