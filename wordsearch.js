var mongoose = require('mongoose');
var superagent = require('superagent');
var WordSearchTemplate = require('./models/WordSearchTemplate');
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
      download('http://db.wordsearchcreatorhq.com/wsearches/' + res.body + '.png', 'wsearches/' + res.body + '.png', function(){
        console.log('done downloading');
        var stream;

        if(wS.height > wS.width) {
          // Create a document
          var doc = new PDFDocument();

          stream = doc.pipe(fs.createWriteStream('wsearches/'+ res.body +'.pdf'));

          var marginLeft = 50;
          var marginTop = 50;

          // draw some text
          doc.fontSize(25)
          .text(data.title, marginLeft, marginTop);

          doc.image('wsearches/' + res.body + '.png', marginLeft, 50 + marginTop, {fit: [500, 480]});

          // and some justified text wrapped into columns
          var words = data.words;
          var lineHeight = 3;
          var columns = 3;
          doc.text('', marginLeft, 550 + marginTop)
          .fontSize(10)
          .text(words.join('\n'), {
            width: 412,
            align: 'left',
            indent: 30,
            columns: columns,
            lineGap: lineHeight,
            height: 100,
            ellipsis: true
          });

          doc.end();

        }
        else {
          var doc = new PDFDocument({
            layout : 'landscape'
          });
        //var stream = doc.pipe(blobStream());

        stream =  doc.pipe(fs.createWriteStream('wsearches/'+ res.body +'.pdf'));

        var marginLeft = 50;
        var marginTop = 50;

        // draw some text
        doc.fontSize(25)
        .text(data.title, marginLeft, marginTop);

        doc.image('wsearches/' + res.body + '.png', marginLeft, 50+ marginTop,{fit: [670, 350]});

        // and some justified text wrapped into columns
        var words = data.words;
        var lineHeight = 3;
        var columns = 4;
        doc.text(' ', marginLeft, 420 + marginTop)
        .fontSize(10)
        //.moveDown()
        .text(words.join('\n'), {
          width: 650,
          align: 'left',
          indent: 30,
          columns: columns,
          lineGap: lineHeight,
          height: 80,
          ellipsis: true
        });

        doc.end();
      }

      stream.on('finish', function() {
        console.log('finished creating pdf');
          emailWordsearch({title: data.title, file: 'wsearches/'+ res.body + '.pdf', emailTo: data.email}, function(){
            console.log('done')
            fs.appendFile('emailsSent.txt', data.email + ',' + data.title + ',' + getDateTime(), function (err) {

            });
          })
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
  console.log(data.title + data.emailTo + data.file);
  postmark.send({
    "From": "info@wordsearchcreatorhq.com",
    "To": data.emailTo,
    "Subject": "Wordsearch - " + data.title,
    "TextBody": "Hi there,\r\n\r\nYou can now download the " + data.title + " wordsearch you generated at http://www.wordsearchcreatorhq.com/wsearches/" + data.file + " .\r\n\r\nOf course, there are loads more themes to choose from. So head on over to http://www.wordsearchcreatorhq.com to create some more word searches. Please share with as many friends as you like!\r\n\r\nEnjoy the search for words!\r\n\r\nKind Regards\r\nBjorn Holdt",
  }, function(error, success) {
    if(error) {
      console.error("Unable to send via postmark: " + error.message);
      done();
      return;
    }
    console.info("Sent to postmark for delivery");
    done();
  });
}


exports.generate = generate;
