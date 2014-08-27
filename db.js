var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/wordsearches');

var WordSearchTemplate = require('./models/WordSearchTemplate');

var wordsearches = require('./data.js').ws;

var db = mongoose.connection;
mongoose.connection.db.dropDatabase();
db.on('error', console.error.bind(console, 'connection error:'));
var savedItems = 0;
db.once('open', function callback () {
  for(var i = 0; i<wordsearches.length; i++){
    var item = wordsearches[i];
    var dbItem = new WordSearchTemplate({title: item.Title, words: item.DefaultWords, pattern: item.Pattern, height: item.PatternHeight, width: item.PatternWidth});
    dbItem.save(function(err, v){
      if(err) throw err;
      console.log(v.title + ' created ' + savedItems);
      savedItems++;
      if(savedItems + 1 === wordsearches.length)
        process.exit();
    });
  }

});
