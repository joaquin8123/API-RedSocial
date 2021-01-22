'use strict'
var express = require('express')
var PublicationController = require('../controllers/publication.controller')
var api = express.Router()
var md_auth = require('../middlewares/authenticated')
var multipart = require('connect-multiparty')
var md_upload = multipart({ uploadDir: './uploads/publications'})

//Peticiones GET
api.get('/pruebas-publication',md_auth.ensureAuth , PublicationController.prueba)
api.get('/publications',md_auth.ensureAuth , PublicationController.getPublications)
api.get('/publication/:publicationId',md_auth.ensureAuth , PublicationController.getPublication)
api.get('/get-image-publication/:imageFile',md_auth.ensureAuth ,PublicationController.getImageFile)
//Peticiones POST
api.post('/save-publication',md_auth.ensureAuth , PublicationController.savePublication)
api.post('/upload-image-publication/:publicationId',[md_auth.ensureAuth, md_upload] ,PublicationController.uploadImage)

//Peticiones PUT


//Peticiones DELETE
api.delete('/delete-publication/:publicationId',md_auth.ensureAuth , PublicationController.deletePublication)
api.delete('/delete-image-publication/:publicationId',md_auth.ensureAuth , PublicationController.deleteImage)
module.exports = api