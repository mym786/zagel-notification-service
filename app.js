var app = require('express')();
const bodyParser = require('body-parser')

app.use(bodyParser.json())

const notification = require('./routes/notification');

// routes
app.use('/notify', notification);

// hooks
require('./hooks/kafka-consumer');

module.exports = app;