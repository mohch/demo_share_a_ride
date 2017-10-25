var mongoose = require('mongoose');

var BookingSchema = new mongoose.Schema({
    commuter_name: {
        type: String,
        required: true
    },
    commuter_id: { 
            type: String,
            required: true
    },
    driver_name: {
            type: String,
            required: true
    },
    driver_id: {
            type: String,
            required: true
    },
    gate: {
        type: String,
        required: true
    },
    coordinates : [Number],
    status : {
        type: Boolean,
        required: true
    },
    number : { type : Number

    }

});

module.exports.booking_model = mongoose.model('BookingSchema', BookingSchema, 'booking'); 