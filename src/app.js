const express = require('express');
const bodyParser = require('body-parser');
require('express-async-errors');
const { sequelize } = require('./model');
const routes = require('./routes/index');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);
app.use('/', routes);
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send(err.message)
})

module.exports = app;
