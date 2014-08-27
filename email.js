var data = { emailTo: 'bm.holdt@gmail.com', title: 'Test' };
var postmark = require("postmark")(require('./postmarkApiKey'));
console.log(data.title + data.emailTo + data.file);
postmark.send({
  "From": "info@wordsearchcreatorhq.com",
  "To": data.emailTo,
  "Subject": "Wordsearch - " + data.title,
  "TextBody": "Hey there,\r\n Please find attached your wordsearch that you generated on http://www.wordsearchcreatorhq.com. \r\nPlease share.",
  /*"Attachments": [{
    "Content": fs.readFileSync(data.file).toString('base64'),
    "Name": data.title + ".pdf",
    "ContentType": "application/pdf"
  }]*/
}, function(error, success) {
  if(error) {
    console.error("Unable to send via postmark: " + error.message);
    return;
  }
  console.info("Sent to postmark for delivery");
});
