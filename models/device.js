const mongoose = require('mongoose');

module.exports = mongoose.model('Device', new mongoose.Schema({
    ultradata: String,
    motiondata: String,
    date: String
}, { collection: 'sensorvalues' }));