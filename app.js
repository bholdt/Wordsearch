var express = require('express');
var request = require('superagent');
var bodyParser = require('body-parser');
var ravendb = require('ravendb');
var mongoose = require('mongoose');
var wordsearch = require('./wordsearch');
var WordSearchTemplate = require('./models/WordSearchTemplate');
var GeneratedWordSearch = require('./models/GeneratedWordsearch');

mongoose.connect('mongodb://localhost/wordsearches');
var db = mongoose.connection;


var app = express(); // better instead
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.send(500, 'Something broke!');
});

app.get('/api/generatedWordsearch', function(req, res) {

  if(req.query.id) {
    GeneratedWordSearch.findById(req.query.id, function(err, item){
      res.send(item);
    });
  }
  else {
    res.send({});
  }
});

app.get('/api/wordsearch', function(req, res) {

  if(req.query.id) {
    WordSearchTemplate.findById(req.query.id, function(err, item){
      res.send(item);
    });
  }
  else {
    var list =[];
    WordSearchTemplate.find(function(err, items){

      for (index = 0; index < items.length; ++index) {
        var item = items[index];
        list.push({
          id: item.id,
          title: item.title,
          words: item.words,
          image: 'test.png'
        });
      }
      res.send(list);
    });
  }


});

app.post('/api/wordsearch/generate', function(req, res){
  var id = req.body.id,
  title = req.body.title,
  words = req.body.words,
  email = req.body.email;

  wordsearch.generate({
    title: title,
    words: words,
    email: email,
    id: id
  }, function(){
  })
    res.send({ 'content': 'Wordsearch is on its way'})

});

app.listen(3000);
