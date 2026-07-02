const express = require('express');
const path = require('path');
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

app.use(express.json());
app.use(cookieParser());

// make uploads accessible
app.use('/uploads', express.static('uploads'));

// routers
app.use('/api/auth', authrouter);
app.use('/api/user', userrouter);
app.use('/api/cars', carrouter);
app.use('/api/orders', orderrouter);

// catch-all route for undefined API routes
app.all(/^\/api\/.*/, (req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback route for all other requests
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// connect to MongoDB and start the server
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} on url ${process.env.BASE_URL}`);
    });
});