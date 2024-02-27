// Server

const express = require ('express');
const bodyParser = require ('body-parser');
const session = require ('express-session');
const bcrypt = require ('bcryptjs');
const mongoose = require ('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection

mongoose.connect('mongodb://localhost:27017/nodejs_login', {useNewUrlParser: true, useUnifiedTopology: true});

// User schema

const User = mongoose.model('User', {
    username: String,
    password: String
});

app.use(bodyParser.urlencoded)