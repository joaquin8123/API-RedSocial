'use strict'
var Follow = require('../models/follow')
var User = require('../models/user')
var path = require('path')
var fs = require('fs')
var mongoosePaginate = require('mongoose-pagination')

const followController = {}
//Prueba
followController.prueba = (req, res) =>{
    res.status(200).send({
        message: 'Welcome to follow'
    })
}
//Guardar follow
followController.saveFollow = async(req, res) =>{
    var params = req.body
    var follow = new Follow()
    follow.user = req.user.sub
    follow.followed = params.followed
    await follow.save((err,followStored) =>{
        if(err) res.status(500).send({message:'Error al guardar seguimiento'})
        if(!followStored) res.status(404).send({message:'El seguimiento no se ha guardado'})
        res.status(200).send({followStored})
    })
}
//Borrar Follow
followController.deleteFollow = async(req, res) =>{
    var userId = req.user.sub
    var followId = req.params.id
    await Follow.find({'user': userId, 'followed': followId}).remove(err =>{
        if(err) res.status(500).send({message:'Error al dejar de seguir'})
        return res.status(200).send({message:'follow eliminado'})
    })
}
//Devuelve los usuarios que sigues, por defecto el logueado sino el que viene por parametro
followController.getFollowingUsers = async(req, res) =>{
    var userId = req.user.sub
    var page = 1
    var itemsPerPage = 4
    if(req.params.id){userId = req.params.id}
    if(req.params.page){page = req.params.page}
    await Follow.find({'user': userId}).populate({path: 'followed'}).paginate(page,itemsPerPage,(err, follows,total)=>{
        if(err) res.status(500).send({message:'Error en el seguidor'})
        if(!follows) res.status(404).send({message:'No hay follows'})
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            follows
        })
    })
}
//Devuelve los seguidores de un usuario,por defecto el logueado sino el que viene por parametro
followController.getFollowedUsers = async(req,res) => {
    var userId = 0
    var page = 1
    var itemsPerPage = 2
    if(req.params.id){
        userId = req.params.id
    }else{
        userId = req.user.sub
    }
    if(req.params.page){page = req.params.page}
    await Follow.find({'followed': userId}).populate('user').paginate(page,itemsPerPage,(err, follows,total)=>{
        if(err) res.status(500).send({message:'Error en el seguidor'})
        if(!follows) res.status(404).send({message:'No tienes followers'})
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            follows
        })
    })  
}



module.exports = followController