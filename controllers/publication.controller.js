'use strict'
var path = require('path')
var fs = require('fs')
var mongoosePaginate = require('mongoose-pagination')
var moment = require('moment')
//Modelos
var Publication = require('../models/publication')
var Follow = require('../models/follow')
var User = require('../models/user')
const user = require('../models/user')

const publicationController = {}
//Prueba
publicationController.prueba = (req, res) =>{
    res.status(200).send({
        message: 'Welcome to publications'
    })
}

//Funcion para guardar una publicacion
publicationController.savePublication = (req, res) =>{
    var params = req.body
    var userId = req.user.sub
    if(!params.text) return res.status(500).send({message:'Debe enviar un texto'})
    var publication = new Publication()
    publication.text = params.text
    publication.file = 'null'
    publication.created_at = moment().unix()
    publication.user = userId
    publication.save((err,publicationStored)=>{
        if(err) return res.status(500).send({message:'Error al guardar publicacion'})
        if(!publicationStored) return res.status(404).send({message:'La publicacion no se guardo'})
        res.status(200).send({publicationStored})
    })
}

//Funcion lista las publicaciones de los usuarios que seguis
publicationController.getPublications = async(req, res) =>{
    var page = 1
    var verItemsPage = 4
    var userId = req.user.sub
    var followsIds = []
    if (req.params.page) page = req.params.page
    try {
        var follows = await Follow.find({user: userId}).populate('followed').select({'_id':0,'__v':0,'user':0})
        follows.forEach(element => {
        followsIds.push(element.followed._id)
    });    
    } catch (err) {
        console.log(err)
    }
    try {
        var publicationsFollows = await Publication.find({user: {"$in": followsIds}}).sort('-created_at').populate('user').paginate(page,verItemsPage, (err,publications,total)=>{
            if(err) return res.status(500).send({message: 'Error en la peticion de las publicaciones'})
            if(!publications) return res.status(404).send({message: 'No se mostraron publicaciones'})
            return res.status(200).send({
                                        Publications: publications,
                                        TotalItems: total,
                                        Pages: Math.ceil(total/verItemsPage)
            })
        })    
    } catch (error) {
        console.log(error)
    }
}
//Obtener una publicacion
publicationController.getPublication = async(req,res) => {
   var publicationId = req.params.publicationId
   await Publication.findById(publicationId,(err,publication) => {
        if(err) return res.status(500).send({message: 'Error en la peticion de la publicacion'})
        if(!publication) return res.status(404).send({message: 'No se encontro la publicacion'})
        return res.status(200).send({publication })
   })
}
//Borrar una publicacion del usuario logueado
publicationController.deletePublication = async(req,res) => {
    var publicationId = req.params.publicationId
    var userId = req.user.sub
    await Publication.find({'user': userId, '_id': publicationId}).deleteOne((err,deletePublication) => {
        if(err) return res.status(500).send({message: 'Error al eliminar publicacion'})
        if(deletePublication.deletedCount === 0) return res.status(404).send({message: 'No se borro la publicacion'})
        return res.status(200).send({deletePublication })
   })
}
//Subir un file a una publicacion del usuario
publicationController.uploadImage = async(req,res) =>{
    var publicationId = req.params.publicationId
    var userId = req.user.sub
    // req.files arrays de ficheros en la request
    var filePath = `./${req.files.image.path}`
    
    if(req.files.image.size != 0) {
        //filePath = `./${req.files.image.path}`
        var fileSplit = filePath.split('\\')
        var fileName = fileSplit[2]
        var extensionSplit = fileName.split('\.')
        var fileExt = extensionSplit[1]
        if(fileExt == 'jpg' || fileExt == 'png' || fileExt == 'gif' || fileExt == 'jpeg' ){
            //Valido que la publicacion sea del usuario autenticado
            await Publication.find({'user': userId, '_id':publicationId}).exec(async(err,publication) =>{
                //Actaliza la publicacion
                if(err) return res.status(500).send({message: 'Error en el usuario asociado a la publicacion'})
                if(publication.length > 0){
                    await Publication.findByIdAndUpdate(publicationId, {file: fileName}, {new: true}, (err, publicationUpdate) =>{
                        if(err) return res.status(500).send({message: 'Error en la peticion'})
                        if(!publicationUpdate) return res.status(404).send({message: 'No se ha podido actualizar'})
                        return res.status(200).send({publicationUpdate})
                    })
                }else{
                    return removeFileUpload(res,filePath,'No tienes permiso para editar esta publicacion')            
                }
            })
        }else{ return removeFileUpload(res,filePath,'Formato de imagen no valido')}
    } else {
        return removeFileUpload(res,filePath,'No se han subido imagenes')    
    }
}
//Borrar una imagen de una publicacion del usuario logueado
publicationController.deleteImage = async(req,res)=>{
    var publicationId = req.params.publicationId
    var userId = req.user.sub
    await Publication.findById(publicationId,(err,data)=>{
        if (userId != data.user) return res.status(404).send({message: 'No tienes permiso para borrar este file'})
        var filePath = `./uploads/publications/${data.file}`
        data.file = 'null'
        try {
            data.save()
        } catch (error) {
            console.log(error)
        }
        return removeFileUpload(res,filePath,'Se borro la imagen de la publicacion')
    })
}
//Obtener una imagen
publicationController.getImageFile = async (req,res) =>{
    var imageFile = req.params.imageFile
    var pathFile = `./uploads/publications/${imageFile}`
    fs.exists(pathFile,(exists)=>{
        if(exists){
            res.sendFile(path.resolve(pathFile))
        } else {
            res.status(200).send({meessage:'No existe la imagen'})
        }
    })
}  
//Eliminar imagen en la carpeta uploads, esto se hace pq el multiparti no valida, sube igual la imagen
function removeFileUpload (res,filePath, message){
    fs.unlink(filePath, ()=>{
        return res.status(200).send({message: message})
    })
}
module.exports = publicationController