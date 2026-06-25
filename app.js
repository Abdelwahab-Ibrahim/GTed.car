const express = require('express');
const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/dbconn');

const authrouter = require('./routes/auth');
const userrouter = require('./routes/user');
const carrouter = require('./routes/car');
const orderrouter = require('./routes/order');

const PORT = process.env.PORT || 3000;

connectDB();

const app = express();

app.use(cookieParser());

// make uploads accessible
app.use('/uploads', express.static('uploads'));
app.use(express.json());

// routers
app.use('/auth', authrouter);
app.use('/user', userrouter);
app.use('/cars', carrouter);
app.use('/order', orderrouter);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on ${process.env.BASE_URL}`);
    });
});