const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');


// default options
app.use(fileUpload()); //TODOS LOS ARCHIVOS QUE SE CARGUEN VAN DENTRO DE req.files
//FILE UPLOAD tiene parametros para diferentes configuraciones


app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningún archivo'
                }
            });
    }

    //Validar tipo
    let tiposValidos = ['productos', 'usuarios'];

    if(tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', ')
            }
        });
    }


    let archivo = req.files.archivo;

    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if(extensionesValidas.indexOf(extension) < 0){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', ')
            }
        });
    }

    // Cambiar nombre al archivo
    //183912kuasidauso-123.jpg
    //let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    let nombreArchivo = `${id}.${extension}`;

    //`uploads/${tipo}/${archivo.name}`
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err){
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }

        // Aquí imagen cargada
        if(tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else if(tipo === 'productos'){
            imagenProducto(id, res, nombreArchivo);
        }

        // res.json({
        //     ok: true,
        //     message: 'Imagen subida correctamente'
        // })
    });
});

function imagenUsuario(id, res, nombreArchivo, tipo){
    Usuario.findById(id, (err, usuarioBD) => {

        if(err){
            borraArchivo(nombreArchivo, tipo);
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!usuarioBD){
            borraArchivo(nombreArchivo, tipo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borraArchivo(usuarioBD.img, tipo);

        usuarioBD.img = nombreArchivo;

        usuarioBD.save((err, usuarioGuardado) =>{

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        });
    })
}

function imagenProducto(id, res, nombreArchivo, tipo){
    Producto.findById(id, (err, productoBD) => {

        if(err){
            borraArchivo(nombreArchivo, tipo);
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!productoBD){
            borraArchivo(nombreArchivo, tipo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        borraArchivo(productoBD.img, tipo);

        productoBD.img = nombreArchivo;

        productoBD.save((err, productoGuardado) =>{

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        });
    })
}

function borraArchivo(nombreImagen, tipo){

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if(fs.existsSync(pathImagen)){
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;