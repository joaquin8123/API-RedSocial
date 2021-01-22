'use strict'
var express = require('express')
var UserController = require('../controllers/user.controller')
var api = express.Router()
var md_auth = require('../middlewares/authenticated')
var multipart = require('connect-multiparty')
var md_upload = multipart({ uploadDir: './uploads/users'})

//Peticiones GET
api.get('/home', UserController.home)
//parametro id obligatorio :id
api.get('/user/:id',md_auth.ensureAuth ,UserController.getUser)
//parametro de page opcional :page?
api.get('/users/:page?',md_auth.ensureAuth ,UserController.getUsers)
api.get('/get-image-user/:imageFile',md_auth.ensureAuth ,UserController.getImageFile)
api.get('/counters/:id',md_auth.ensureAuth ,UserController.getCounters)

//Peticiones POST
api.post('/register',UserController.saveUser)
api.post('/login', UserController.loginUser)
api.post('/pruebas',md_auth.ensureAuth ,UserController.home)
api.post('/upload-image-user/:id',[md_auth.ensureAuth, md_upload] ,UserController.uploadImage)

//Peticiones PUT
api.put('/update-user/:id',md_auth.ensureAuth ,UserController.updateUser)

//Peticiones DELETE

module.exports = api