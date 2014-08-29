var mongoose = require('mongoose');
var superagent = require('superagent');
var WordSearchTemplate = require('./models/WordSearchTemplate');
var GeneratedWordsearch = require('./models/GeneratedWordsearch');
var PDFDocument = require('pdfkit');
var fs = require('fs'),
request = require('request');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function generate(data, done){
  //load the pattern
  WordSearchTemplate.findById(data.id, function(err, wS){
    if(err) throw err;
    superagent
    .post('http://db.wordsearchcreatorhq.com/wordsearch/createwordsearch')
    .send({ Words: data.words, Pattern: wS.pattern.join('\r\n') })
    .set('Accept', 'application/json')
    .end(function(error, res){
      console.log('downloading picture' + res.body);
      download('http://db.wordsearchcreatorhq.com/wsearches/' + res.body + '.png', 'public/wsearches/' + res.body + '.png', function(){
        console.log('done downloading');

        var generatedWordsearch = new GeneratedWordsearch();
        generatedWordsearch.title = data.title;
        generatedWordsearch.email = data.email;
        generatedWordsearch.themeId = data.id;
        generatedWordsearch.words = data.words;
        generatedWordsearch.wordsearchImage = 'wsearches/' + res.body + '.png';
        generatedWordsearch.generatedOn = new Date();
        generatedWordsearch.save(function(err, item) {
          if(err) throw err;
          emailWordsearch({ id: item.id, title: data.title, emailTo: data.email }, function(){
            console.log('done');
          });
        });


    });

  });
});

}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}


var emailWordsearch = function(data, done){

  var postmark = require("postmark")(require('./postmarkApiKey'));
  postmark.send({
    "From": "info@wordsearchcreatorhq.com",
    "To": data.emailTo,
    "Subject": "Wordsearch - " + data.title,
    "TextBody": "Hi there,\r\n\r\nYou can now download the " + data.title + " wordsearch you generated at http://www.wordsearchcreatorhq.com/download.html?id=" + data.id + " .\r\n\r\nOf course, there are loads more themes to choose from. So head on over to http://www.wordsearchcreatorhq.com to create some more word searches. Please share with as many friends as you like!\r\n\r\nEnjoy the search for words!\r\n\r\nKind Regards\r\nBjorn Holdt",
  }, function(error, success) {
    if(error) {
      console.error("Unable to send via postmark: " + error.message);
    console.log(data.id)
      done();
      return;
    }
    console.info("Sent to postmark for delivery");
    console.log(data.id)
    done();
  });
}


exports.generate = generate;
