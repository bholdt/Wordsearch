var superagent = require('superagent');
var WordSearchTemplate = require('./models/WordSearchTemplate');
var PDFDocument = require('pdfkit');
var fs = require('fs'),
request = require('request');

console.log('done downloading');
var stream;

if(200 > 100) {
  // Create a document
  var doc = new PDFDocument();

  stream = doc.pipe(fs.createWriteStream('wsearches/1.pdf'));

  var marginLeft = 50;
  var marginTop = 50;

  // draw some text
  doc.fontSize(25)
  .text('data.title', marginLeft, marginTop);

  doc.image('wsearches/717cd105dd1c44bf821928df9ec79353.png', marginLeft, 50 + marginTop, {fit: [500, 480]});


  // and some justified text wrapped into columns
  var words = ['test','tes'];
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
.text('data.title', marginLeft, marginTop);

doc.image('wsearches/' + res.body + '.png', marginLeft, 50+ marginTop,{fit: [670, 350]});

// and some justified text wrapped into columns
var words = ['data.words'];
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
