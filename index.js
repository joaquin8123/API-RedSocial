'use strict'

var mongoose = require('mongoose')
var app = require('./app')
var port = 3800

//Crear Conexion
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/mean_red_social', {
    useMongoose: true
})
    .then( () => {
        console.log('Database conection sucessfuly')
        // Iniciar servidor
        app.listen(port, () => {
            console.log('Server Runnig port:', port)
        })
    })
    .catch(err => console.log(err))