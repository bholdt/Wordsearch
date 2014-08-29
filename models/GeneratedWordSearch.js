var mongoose = require('mongoose');
module.exports = mongoose.model('GeneratedWordsearch',
{ title: String,
  words: Array,
  wordsearchImage: String,
  email: String,
  generatedOn: Date,
  themeId: String
});
