const mongoose = require('mongoose');

const connectdb = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
    } catch (err) {
        console.error(err);
    }
};


module.exports = connectdb;