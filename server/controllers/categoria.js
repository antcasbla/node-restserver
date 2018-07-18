const express = require('express');

let {verificaToken, verificaAdminRole} = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');


//===================================
//   MOSTRAR TODAS LAS CATEGORIAS
//===================================
app.get('/categoria', verificaToken, (req, res) =>{
   //TODAS LAS CATEGORIAS, SIN PAGINAR

    Categoria.find({})
        .sort('descripcion') // Ordenar por descripción
        .populate('usuario', 'nombre email') //Queremos que se muestren los campos nombre y email de la relación con usuario
        .exec((err, categorias) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Categoria.count((err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });
            });

        });

});

//===================================
//   MOSTRAR UNA CATEGORIA POR ID
//===================================
app.get('/categoria/:id', verificaToken, (req, res) =>{
    //Categoria.findById(...);
    let id = req.params.id;

    Categoria.findById(id)
        .populate('usuario', 'nombre email') //Queremos que se muestren los campos nombre y email de la relación con usuario
        .exec((err, categoriaDB) => {

        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//===================================
//        CREAR NUEVA CATEGORIA
//===================================
app.post('/categoria', verificaToken,(req, res) =>{
    //Regresa la nueva categoria
    //req.usuario_id

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    //Guardado en BDD por Mongoose
    categoria.save((err, categoriaDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    });

});

//===================================
//        ACTUALIZAR CATEGORIA
//===================================
app.put('/categoria/:id', verificaToken,(req, res) =>{
    //Actualizar descripción de categoria
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, {new: true, runValidators: true}, (err, categoriaDB) => {

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//===================================
//      BORRADO DE UNA CATEGORIA
//===================================
app.delete('/categoria/:id', [verificaToken, verificaAdminRole],(req, res) =>{
    //Solo un administrados puede borrar categorias
    //Borrar fisicamente
    //Categoria.findByIdAndRemove

    let id = req.params.id;

    //Eliminado REAL
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaBorrada){
            return res.status(400).json({
                ok: false,
                err:{
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria Borrada'
        })

    })
});


module.exports = app;