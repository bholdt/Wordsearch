var mongoose = require('mongoose');
module.exports = mongoose.model('WordSearchTemplate',
{ title: String,
  words: Array,
  pattern: Array,
  height: Number,
  width: Number
});
