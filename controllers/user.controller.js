'use strict'
var User = require('../models/user')
var Publication = require('../models/publication')
var Follow = require('../models/follow')
var bcrypt = require('bcrypt-nodejs')
var jwt = require('../services/jwt')
var mongoosePaginate = require('mongoose-pagination')
var fs = require('fs')
var path = require('path')

const userController = {}

//Prueba
userController.home = (req, res) =>{
    res.status(200).send({
        message: 'Welcome to Home'
    })
}

//Registro
userController.saveUser = async(req,res) =>{
    var params = req.body
    var user = new User()
    if(params.name && params.surname && params.nick && params.email && params.password){
        user.name = params.name
        user.surname = params.surname
        user.nick = params.nick
        user.email = params.email
        user.role = 'USER_ROLE'
        user.image = null
        await User.find({ $or: [
                {email: user.email.toLowerCase()},
                {nick: user.nick.toLowerCase()}
        ]}).exec((err,users) => {
            if (err) return res.status(500).send({message:'Error en la peticion de usuarios'})
            if (users && users.length>=1){
                return res.status(500).send({message:'Usuario Duplicado'})
            } else {
                bcrypt.hash(params.password, null, null, (err,hash) =>{
                    user.password = hash
        
                    user.save( (err, userStored) =>{
                        if(err) return res.status(500).send({message:'Error al guardar el usuario'})
                        if(userStored){
                            res.status(200).send({user: userStored})
                        }else{
                            res.status(404).send({meessage:'No se ha registrado el usuario' })
                        }
                    })
                }) 
            }
        })
      
    } else{
        res.status(200).send({ 
            message: 'Datos invalidos'
        })
    }
}

//Login
userController.loginUser= async(req,res) =>{
    var params = req.body
    var email = params.email
    var password = params.password

    await User.findOne({email: email}, (err, user) => {
        if(err) return res.status(500).send({message:'Error en la peticion de login'})
        
        if(user){
            bcrypt.compare(password, user.password, (err,check) => {
                if(check){
                   
                    if(params.gettoken){
                        //Devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        })
                    }else{
                         //Devolver datos de usuario
                        user.password = undefined
                        return res.status(200).send({user})
                    }
                    

                } else {
                    return res.status(404).send({message:'El usuario no pudo logearse'})
                }
            })
        }else{
            return res.status(404).send({message:'El usuario no existe'})
        }
    })
}

//Devuelve un seguidor del usuario logueado
userController.getUser = async(req,res) => {
    //params para datos que vienen en la url
    var userId= req.params.id
    await User.findById(userId, (err, user) => {
        if(err) return res.status(500).send({message:'Error en la peticion'})
        if(!user) return res.status(404).send({message:'Usuario no existe'})
        Follow.findOne({'user': req.user.sub, 'followed':userId}).exec((err,follow) => {
            if(err) return res.status(500).send({message:'Error en la peticion follow'})
            return res.status(200).send({user,follow})
        })
        
    })
}

//Devolver un listado de usuarios paginado
userController.getUsers = async(req,res) =>{
    var identityUserId = req.user.sub
    var page = 1
    if(req.params.page){
        page = req.params.page
    }
    var itemsPerPage = 5
    await User.find().sort('_id').paginate(page,itemsPerPage, (err, users, total) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'})
        if(!users) return res.status(404).send({message: 'Usuario no existe'})
        followUserIds(identityUserId).then((value)=>{
            console.log(value.following)
            return res.status(200).send({
                users,
                userFollowing: value.following,
                userFollowMe: value.followed,
                total,
                pages: Math.ceil(total/itemsPerPage)
            })
        })
        
    })
}

//Actualiza el usuario logueado
userController.updateUser= async(req,res) =>{
    var userId = req.params.id
    var update = req.body
    //borrar propiedad password
    delete update.password
    if(userId != req.user.sub) return res.status(500).send({message:'Permiso de actualizacion de usuario dengado'})
    //new: true para que devuelva el usuario actualizado
    await User.findByIdAndUpdate(userId, update,{new: true}, (err, userUpdate) => {
        if(err) return res.status(500).send({message:'Error en la peticion'})
        if(!userUpdate) return res.status(404).send({message:'Usuario no actualizado'})
        return res.status(200).send({userUpdate})

    })

}

//Subir imagen o avatar usuario logueado
userController.uploadImage = async(req,res) =>{
    var userId = req.params.id
    // req.files arrays de ficheros en la request
    var filePath = `./${req.files.image.path}`
    
    if(userId != req.user.sub) {
        return removeFileUpload(res,filePath,'No puedes actualizar los datos del usuario')
    } 
    
    if(req.files.image.size != 0) {
        //filePath = `./${req.files.image.path}`
        var fileSplit = filePath.split('\\')
        var fileName = fileSplit[2]
        var extensionSplit = fileName.split('\.')
        var fileExt = extensionSplit[1]
        if(fileExt == 'jpg' || fileExt == 'png' || fileExt == 'gif' || fileExt == 'jpeg' ){
            await User.findByIdAndUpdate(userId, {image: fileName}, {new: true}, (err, userUpdate) =>{
                if(err) return res.status(500).send({message: 'Error en la peticion'})
                if(!userUpdate) return res.status(404).send({message: 'No se ha podido actualizar'})
                return res.status(200).send({userUpdate})
            })
        } else{
            return removeFileUpload(res,filePath,'Formato de imagen no valido')
        }
    } else {
        return removeFileUpload(res,filePath,'No se han subido imagenes')
        
    }

}
//Eliminar imagen en la carpeta uploads, esto se hace pq el multiparti no valida, sube igual la imagen
function removeFileUpload (res,filePath, message){
    fs.unlink(filePath, ()=>{
        return res.status(200).send({message: message})
    })
}

//Obtener una imagen
userController.getImageFile = async (req,res) =>{
    var imageFile = req.params.imageFile
    var pathFile = `./uploads/users/${imageFile}`
    fs.exists(pathFile,(exists)=>{
        if(exists){
            res.sendFile(path.resolve(pathFile))
        } else {
            res.status(200).send({meessage:'No existe la imagen'})
        }
    })
}   

//Retorna los follwing y followed de un usuario
async function followUserIds(userId){
    
    //select para no traer los datos
    var following = await Follow.find({'user': userId}).select({'_id':0,'__v':0,'user':0}) //.exec((err,follows)=>{
        var followsClean = []
        //follows.forEach((follow) => {
            //followsClean.push(follow.follwed)
       //})
        //console.log(follows)
        //return follows
    //})
    var followed = await Follow.find({'followed': userId}).select({'_id':0,'__v':0,'followed':0}) //.exec((err,follows)=>{
        //var followsClean = []
        //follows.forEach((follow) => {
            //followsClean.push(follow.user)
        //})
        //return follows
    //})
    return {
        following: following,
        followed: followed
    }
}

//Retorna cantidad de seguidos,seguidores y publicaciones
userController.getCounters = async(req,res) => {
    var userId = req.user.sub
    if(req.params.id){
        userId = req.params.id
    }
    getCountFollows(userId).then((value)=>{
        return res.status(200).send(value)
    })
}

async function getCountFollows(userId){
    var following = await Follow.count({'user':userId}) /*.exec((err,count)=>{
        if(err) return handleError(err)
        return count
    })*/
    var followed = await Follow.count({'followed':userId}) /*.exec((err,count)=>{
        if(err) return handleError(err)
        return count
    })*/
     
    var publications = await Publication.count({'user':userId}) /*.exec((err,count)=>{
        if(err) return handleError(err)
        return count
    })*/
    return {
        following: following,
        followed: followed,
        publications: publications
    }
}

module.exports = userController