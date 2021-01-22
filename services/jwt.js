'use strict'

var jwt = require('jwt-simple')
var moment = require('moment')
var secret = 'clave_privada'

exports.createToken = function (user){
    var payload = {
        sub: user._id,
        name: user.name,
        nick: user.nick,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        //fecha de creacion del token
        iat: moment().unix(),
        //fecha de expiracion
        exp:moment().add(30,'days').unix()
    }

    return jwt.encode(payload, secret)
}