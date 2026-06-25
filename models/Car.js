const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new Schema({
    manufacturer: {
        type: String,
        required: true
    }, model: {
        type: String,
        required: true
    }, year: {
        type: Number,
        required: true
    }, price: {
        type: Number,
        required: true
    }, color: {
        type: String,
        required: true
    }, milage: {
        type: Number,
        required: true
    }, hp: {
        type: Number,
        required: true
    }, engine: {
        type: String,
        required: true
    }, images: {
        exterior: {
            type: String,
            required: true
        },
        interior: {
            type: String,
            default: null
        }
    }, sellerid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, available: {
        type: Boolean,
        required: true,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);