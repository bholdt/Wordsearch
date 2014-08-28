var mongoose = require('mongoose');
var WordSearchTemplate = require('./models/WordSearchTemplate');
var superagent = require('superagent');
mongoose.connect('mongodb://localhost/wordsearches');

var fs = require('fs'),
request = require('request');
var gm = require('gm');


var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

var resizeAndDownload = function(item, callback){
  console.log('here');
  superagent
  .post('http://db.wordsearchcreatorhq.com/wordsearch/createwordsearch')
  .send({ Words: ['test'], Pattern: item.pattern.join('\r\n') })
  .set('Accept', 'application/json')
  .end(function(error, res){
    console.log('downloading picture' + res.body);
    download('http://db.wordsearchcreatorhq.com/wsearches/' + res.body + '.png', 'wsearches/image' + item.id + '.png', function(){
      console.log('done downloading');
      gm('wsearches/image' + item.id + '.png')
      .resize(300)
      //.autoOrient()
      .write('wsearches/thumb' + item.id +'.png', function (err) {
        if(err) console.log(err);
        if (!err) {console.log(' hooray! ');
        callback(item);}
      });


    }, function(error){
      console.log(error);
    });

  });
}

  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function callback () {
    WordSearchTemplate.find(function(err, items){
      if(err) throw err;
      for(var i = 0; i < items.length; i++) {
        var item = items[i];
        resizeAndDownload(item, function(i){console.log(i.title + ' finished');});
      }
    });

  });
