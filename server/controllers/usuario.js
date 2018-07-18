const express = require('express');

const bcrypt = require('bcrypt');

const _ = require('underscore');

const Usuario = require('../models/usuario');
//Middleware
const {verificaToken, verificaAdminRole} = require('../middlewares/autenticacion');

const app = express();

app.get('/usuario', verificaToken, (req, res) => {

    // FORMATO DEL JSON DE SALIDA
    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email
    // });

    //req.query parametros opcionales de entrada

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    // 'nombre email role estado google img' => para decir qué campos devolver
   Usuario.find({estado: true}, 'nombre email role estado google img')
       .skip(desde) //Quiero que se salte los primeros 5 registros
       .limit(limite) //Me muestre los 5 siguientes
       .exec( (err, usuarios) => {
           if(err){
               return res.status(400).json({
                   ok: false,
                   err
               });
           }

           //{google: true} condiciones para el conteo
           Usuario.count({estado: true}, (err, conteo) => {
               res.json({
                   ok: true,
                   usuarios,
                   cuantos: conteo
               });
           });


       });


});

//crear registro nuevo
app.post('/usuario', [verificaToken, verificaAdminRole], (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), //Para hacerle un hash de una sola via a la password ( con 10 vueltas valdría)
        role: body.role
    });

    console.log(usuario);

    //Guardado en BDD por Mongoose
    usuario.save((err, usuarioDB) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });

    // if(body.nombre === undefined){
    //     //CODIGO DE RESPUESTA EN CASO DE ERROR
    //     res.status(400).json({
    //         ok: false,
    //         mensaje: 'El nombre es necesario'
    //     });
    // }else{
    //     res.json({
    //         persona: body
    //     })
    // }
})

//actualizar registro
app.put('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    //{new: true} para que devuelva el objeto actualizado
    //runValidators: true para que tengan en cuenta las validaciones definidas en el modelo
    Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, usuarioBD) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBD
        });
    });

})

app.delete('/usuario/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;

    // Eliminado REAL
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{
    //
    //     if(err){
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }
    //
    //     //Si no existe el usuario que se le pasa
    //     if(!usuarioBorrado){
    //         return res.status(400).json({
    //             ok: false,
    //             err : {
    //                 message: 'Usuario no encontrado'
    //             }
    //         });
    //     }
    //
    //     res.json({
    //         ok:true,
    //         usuario: usuarioBorrado
    //     })
    //
    // })

    //Eliminado LOGICO
    let body = _.pick(req.body, ['estado']);

    let cambioEstado = {
        estado: false
    }
    body.estado = false;

    //{estado: true},
    Usuario.findByIdAndUpdate(id, cambioEstado, (err, usuarioBorrado) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //Si no existe el usuario que se le pasa
        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                err : {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok:true,
            usuario: usuarioBorrado
        })

    })


})

module.exports = app;