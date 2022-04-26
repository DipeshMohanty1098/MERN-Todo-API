const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv/config')

const app = express();
const authRoute = require('./routes/auth');

//middlewares
app.use(cors());
app.use(express.json());
app.use('/api/user/', authRoute);


mongoose.connect(process.env.DB_CONNECTION,{ useNewUrlParser: true, useUnifiedTopology: true }, () =>{
    console.log('connected to DB!');
})
mongoose.connection.on('connected', function () {
    console.log('Mongoose connected');
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});

app.listen(3001, () => console.log("Server up and running"))
