const jwt = require('jsonwebtoken');

let Categoria = require('../models/categoria');

//=====================
//   VERIFICAR TOKEN
//=====================
let verificaToken = (req, res, next) => {

    let token = req.get('token'); //Authorization

    jwt.verify(token, process.env.SEED, (err, decoded) =>{
        if(err){
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        req.usuario = decoded.usuario;

        //Para que continue la ejecución
        next();
    });
};


//========================
//   VERIFICA ADMIN ROLE
//========================
let verificaAdminRole = (req, res, next) => {

    let usuario = req.usuario;

    if(usuario.role === 'ADMIN_ROLE'){
        //Para que continue la ejecución
        next();
    }else{
        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
};

module.exports = {
    verificaToken,
    verificaAdminRole
}