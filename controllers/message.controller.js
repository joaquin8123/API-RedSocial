'use strict'
var Follow = require('../models/follow')
var User = require('../models/user')
var Message = require('../models/message')
var path = require('path')
var fs = require('fs')
var mongoosePaginate = require('mongoose-pagination')
var moment = require('moment')
const message = require('../models/message')

const messageController = {}
//Prueba
messageController.prueba = (req,res) =>{
    res.status(200).send({Message: 'Probando desde message'})
}
//Guardar message
messageController.saveMessage = async(req,res) =>{
    var userId = req.user.sub
    var params = req.body
    if(!params.text || !params.receiver) return res.status(200).send({message: 'Datos invalidos'})
    var message = new Message()
    message.text = params.text
    message.emitter = userId
    message.receiver = params.receiver
    message.created_at = moment().unix()
    try{
        await message.save((err,messageStored) =>{
            return res.status(200).send({messageStored})
        })
    } catch(err){
        console.log(err)
    }

}
//Listar mensajes recibidos del usuario logueado
messageController.getReceivedMessage = async(req,res) =>{
    var userId = req.user.sub
    var page = 1
    var itemsPerPage = 2

    if(req.params.page){
        console.log('asda')
        page = req.params.page 
    } 
    await Message.find({'receiver': userId}).populate('emitter').paginate(page,itemsPerPage,(err,messageReceived,total)=>{
        if(err) return res.status(500).send({message:'Error en la peticion'})
        if(messageReceived.length === 0) return res.status(404).send({message:'No se encontraron messages'})
        return res.status(200).send({
            total: total,
            pageActual: page,
            pages: Math.ceil(total/itemsPerPage),
            messages: messageReceived
        })
    })
}
module.exports = messageController