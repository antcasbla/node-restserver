const express = require('express');

const {verificaToken} = require('../middlewares/autenticacion');

let app = express();

const _ = require('underscore');

let Producto = require('../models/producto');


// =========================================
//  OBTENER PRODUCTOS
// =========================================
app.get('/productos', verificaToken, (req, res) => {
    //Trae todos los productos
   //populate: usuario categoria
    //paginado

    let limite = req.query.limite || 5;
    limite = Number(limite);

    let desde = req.query.desde || 5;
    desde = Number(desde);

    Producto.find({disponible: true})
        .skip(desde)
        .limit(limite) //Me muestre los 5 siguientes
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.count((err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });
            });

        });
});

// =========================================
//  OBTENER UN PRODUCTO POR ID
// =========================================
app.get('/productos/:id', verificaToken, (req, res) => {
    //populate: usuario categoria
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if(!productoDB){
                return res.status(400).json({
                    ok: false,
                    err:{
                        message: 'El id no existe'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

// =========================================
//      BUSCAR PRODUCTOS
// =========================================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i'); // i , insensible a mayusculas y minusculas

    Producto.find({nombre: regex})
        .populate('categoria', 'nombre')
        .exec((err, productos) =>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        })



});

// =========================================
//  CREAR UN NUEVO PRODUCTO
// =========================================
app.post('/productos', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario.id
    });

    //Guardado en BDD por Mongoose
    producto.save((err, productoDB) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            producto: productoDB
        })
    });

});

// =========================================
//  ACTUALIZAR UN PRODUCTO
// =========================================
app.put('/productos/:id', verificaToken, (req, res) => {
    //grabar el usuario
    //grabar una categoria del listado

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });
        });
    });
});

// =========================================
//  BORRAR UN PRODUCTO
// =========================================
app.delete('/productos/:id', verificaToken, (req, res) => {
    //eliminar actualizando disponible a falso

    let id = req.params.id;

    //Eliminado LOGICO
    let body = _.pick(req.body, ['disponible']);

    let cambioEstado = {
        disponible: false
    }
    body.disponible = false;

    //{disponible: true},
    Producto.findByIdAndUpdate(id, cambioEstado, (err, productoBorrado) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si no existe el producto que se le pasa
        if(!productoBorrado){
            return res.status(400).json({
                ok: false,
                err : {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            id: productoBorrado._id
        })

    })

});


module.exports = app;