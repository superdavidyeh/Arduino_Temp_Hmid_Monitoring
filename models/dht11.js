var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/sensors');
var dht11Schema = new mongoose.Schema({
    'pin': Number,
    'temp':Number,
    'humid': Number,
    'ldate': { type: Date, default: Date.now }
});
var DHT11 = mongoose.model('dht11', dht11Schema);

module.exports = DHT11;