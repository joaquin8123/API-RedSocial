'use strict'
var express = require('express')
var MessageController = require('../controllers/message.controller')
var api = express.Router()
var md_auth = require('../middlewares/authenticated')


//Peticiones GET
api.get('/message-prueba',md_auth.ensureAuth ,MessageController.prueba)
api.get('/messages/:page?',md_auth.ensureAuth ,MessageController.getReceivedMessage)

//Peticiones POST
api.post('/save-message',md_auth.ensureAuth ,MessageController.saveMessage)

//Peticiones PUT
   

//Peticiones DELETE


module.exports = api