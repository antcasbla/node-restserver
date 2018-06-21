require('./config/config');

const express = require('express')
// Using Node.js `require()`
const mongoose = require('mongoose');

const app = express()

const bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


// CONFIGURACIÓN GLOBAL DE RUTAS
// Usar los controladores creados en usuario.js
//app.use(require('./controllers/usuario'));
//app.use(require('./controllers/login'));
//...
//Hacemos solo una referencia al index.js donde
// tenemos todos los controllers añadidos
app.use(require('./controllers/index'));


//mongoose.connect('mongodb://localhost:27017/cafe', (err, res) => {

mongoose.connect(process.env.URLDB, (err, res) => {

    if(err) throw err;

    console.log('Base de datos ONLINE');

});


app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
})