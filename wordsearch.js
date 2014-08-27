var redis = require("redis"),
client = redis.createClient();
var superagent = require('superagent');
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
  client.get("pattern" + data.themeId, function (err, value){
    if(err) done(err);

    var wS = require('./data.js').ws[data.themeId];

  console.log('words: ' + data.words.join(',') + '\r\nPattern:' + wS.Pattern.join('\r\n'));
    superagent
    .post('http://db.wordsearchcreatorhq.com/wordsearch/createwordsearch')
    .send({ Words: data.words, Pattern: wS.Pattern.join('\r\n') })
    .set('Accept', 'application/json')
    .end(function(error, res){
      //console.log(res);
      console.log('downloading picture' + res.body);
      //download the picture
      download('http://db.wordsearchcreatorhq.com/wsearches/' + res.body + '.png', 'wsearches/' + res.body + '.png', function(){
        console.log('done downloading');


        if(wS.PatternHeight > wS.PatternWidth) {
          // Create a document
          var doc = new PDFDocument();

          doc.pipe(fs.createWriteStream('wsearches/'+ res.body +'.pdf'));

          var marginLeft = 50;
          var marginTop = 50;

          // draw some text
          doc.fontSize(25)
          .text(data.title, marginLeft, marginTop);

          doc.image('wsearches/' + res.body + '.png', marginLeft, 50 + marginTop, {fit: [500, 480]});


          // and some justified text wrapped into columns
          var words = data.words;
          var lineHeight = 3;
          var columns = 4;
          doc.text('Words', marginLeft, 550 + marginTop)
          .fontSize(12)
          .moveDown()
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
          }
        );
        //var stream = doc.pipe(blobStream());

        doc.pipe(fs.createWriteStream('wsearches/'+ res.body +'.pdf'));

        var marginLeft = 50;
        var marginTop = 50;

        // draw some text
        doc.fontSize(25)
        .text(data.title, marginLeft, marginTop);

        doc.image('wsearches/' + res.body + '.png', marginLeft, 50+ marginTop,{fit: [670, 350]});

        // and some justified text wrapped into columns
        var words = data.words;
        var lineHeight = 3;
        var columns = 5;
        doc.text('Words', marginLeft, 420 + marginTop)
        .fontSize(12)
        .moveDown()
        .text(words.join('\n'), {
          width: 650,
          align: 'left',
          indent: 30,
          columns: columns,
          lineGap: lineHeight,
          height: 70,
          ellipsis: true
        });

        doc.end();
      }

      var postmark = require("postmark")("YOURAPIKEY");
    postmark.send({
        "From": "info@wordsearchcreatorhq.com",
        "To": data.email,
        "Subject": "Wordsearch - " + data.title,
        "TextBody": "Hey there,\r\n Please find attached your wordsearch that you generated on http://www.wordsearchcreatorhq.com. \r\nPlease share.",
        "Attachments": [{
          "Content": File.readFileSync("wsearches/" + res.body + ".pdf").toString('base64'),
          "Name": data.title + ".pdf",
          "ContentType": "application/pdf"
        }]
    }, function(error, success) {
        if(error) {
            console.error("Unable to send via postmark: " + error.message);
            done(error);
            return;
        }
        console.info("Sent to postmark for delivery");
        done();
    });


    });

  });
});


//send e-mail

}

exports.generate = generate;
