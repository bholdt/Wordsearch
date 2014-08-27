var express = require('express');
var request = require('superagent');
var bodyParser = require('body-parser');
var ravendb = require('ravendb');
var kue = require('kue')
  , jobs = kue.createQueue();
var wordsearch = require('./wordsearch');
var redis = require("redis"),
client = redis.createClient();


var app = express(); // better instead
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.send(500, 'Something broke!');
});

app.post('/api/wordsearch', function(req, res) {
  var themeId = req.body.themeId,
  pattern = req.body.pattern,
  words = req.body.words,
  title = req.body.title;
  words = words.split('\n');
  pattern = pattern.split('\n');

  client.set('wsTheme_' + themeId, JSON.stringify({themeId: themeId, pattern: pattern, words: words, title: title}));

  res.send("success");

});

app.get('/api/wordsearch',function(req, res) {
  var themeId = req.query.themeId;

  var wordsearch = client.get("wsTheme_" + themeId, function(err, value){
    var test = JSON.parse(value);
    res.send(test.title);
  });


});

app.get('/api/raven', function(req, res) {



});

app.post('/api/wordsearch/generate', function(req, res){
  var themeId = req.body.themeId,
  title = req.body.title,
  words = req.body.words,
  email = req.body.email;
  var job = jobs.create('generateWordsearch', {
    title: title,
    words: words,
    email: email,
    themeId: themeId
  }).save( function(err){
      if( !err ) console.log( job.id );
        res.send({ 'content': 'Wordsearch is on its way', 'jobId': job.id})
  });

});



jobs.process('generateWordsearch', function(job, done){
  wordsearch.generate(job.data, done);
});

app.listen(3000);
