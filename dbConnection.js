var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/wordsearches');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {

});

module.exports = db;
