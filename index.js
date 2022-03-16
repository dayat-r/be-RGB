require("dotenv").config();
const bodyParser = require("body-parser");
const express = require('express');
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const app = express();

const path = require('path')


const {
    NODE_ENV,
    PORT_SERVER,
    VERSION_NUMBER, 
    VERSION_DESCRIPTION,
    } = process.env;



const publicRouter = require('./routes/public-router');
const router = require('./routes/router');

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false, parameterLimit: 50000000 }));
app.use(bodyParser.raw());


// API not protected
app.use('/public', publicRouter);

// API protected
app.use('/sion', router);
app.use('/uploads',express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
    res.send({
        'Version': VERSION_NUMBER,
        'Description': VERSION_DESCRIPTION
    });
});


// const { Pool } = require('pg')
// const pool = new Pool({
//     host: 'sion-glass.com',
//     user: 'sionglas_sionglas',
//     database: 'sionglas_dev',
//     password: 'qwerty123!@#'
// })
// pool.query('SELECT NOW()', (err, res) => {
//     console.log(err, res)
//     pool.end()
// })

// Automatically migrate tables 
// const db = require("./models");
// db.sequelize.sync();

const server = app.listen(PORT_SERVER, () =>{
    console.log("Server running on port " + PORT_SERVER);
});

module.exports = server