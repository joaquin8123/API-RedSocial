'use strict'
var express = require('express')
var FollowController = require('../controllers/follow.controller')
var api = express.Router()
var md_auth = require('../middlewares/authenticated')


//Peticiones GET
api.get('/prueba-follow',md_auth.ensureAuth ,FollowController.prueba)
api.get('/following/:id=?/:page?',md_auth.ensureAuth ,FollowController.getFollowingUsers)
api.get('/followers/:id=?/:page?',md_auth.ensureAuth,FollowController.getFollowedUsers)
//Peticiones POST
api.post('/save-follow',md_auth.ensureAuth,FollowController.saveFollow)

//Peticiones PUT
   

//Peticiones DELETE
api.delete('/delete-follow/:id',md_auth.ensureAuth,FollowController.deleteFollow)

module.exports = api