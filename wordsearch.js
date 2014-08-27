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

    superagent
    .post('http://db.wordsearchcreatorhq.com/wordsearch/createwordsearch')
    .send({ Words: data.words, Pattern: value })
    .set('Accept', 'application/json')
    .end(function(error, res){
      console.log('downloading picture');
      //download the picture
      download('http://db.wordsearchcreatorhq.com/wsearches/' + res.body + '.png', 'wsearches/' + res.body + '.png', function(){
        console.log('done downloading');

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
        var columns = 3;
        doc.text('Words', marginLeft, 550 + marginTop)
        .fontSize(15)
        .moveDown()
        .text(words.join('\n'), {
          width: 412,
          align: 'justify',
          indent: 30,
          columns: columns,
          lineGap: lineHeight,
          height: 100,
          ellipsis: true
        });

        doc.end();

        if(error) done(error);
        done();
      });

    });
  });


  //send e-mail

}

exports.generate = generate;
