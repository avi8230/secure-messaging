require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectToMongo = require('./services/mongo');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'https://localhost:3000',
    credentials: true
}));

connectToMongo();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));

module.exports = app;
