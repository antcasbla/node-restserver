require('./config/config');

const express = require('express')
const app = express()

const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/usuario', function (req, res) {
    res.json('get Usuario local')
})

//crear registro nuevo
app.post('/usuario', function (req, res) {

    let body = req.body;

    if(body.nombre === undefined){
        //CODIGO DE RESPUESTA EN CASO DE ERROR
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });
    }else{
        res.json({
            persona: body
        })
    }
})

//actualizar registro
app.put('/usuario/:id', function (req, res) {

    let id = req.params.id;

    res.json({
        id
    })
})

app.delete('/usuario', function (req, res) {
    res.json('delete Usuario')
})

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
})