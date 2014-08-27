var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var winston = require('winston');
var config = require('./config-debug');

describe('Routing', function() {
  var url = 'http://localhost:3000';
  //before(function(done) {
    // In our tests we use the test db
    //mongoose.connect(config.db.mongodb);
    //done();
  //});

  describe('Wordsearch', function() {
    it('should store wordsearch to be processed', function(done){
	var body = {
		themeId: 1,
		title: "testing",
    email: "testing@test.com",
    words: ['test','test2']
	};
	request(url)
		.post('/api/wordsearch/generate')
		.send(body)
		.expect('Content-Type', /json/)
		.expect(200) //Status code
		.end(function(err,res) {
			if (err) {
				throw err;
			}
			res.body.should.have.property('content');
	    res.body.content.should.equal('Wordsearch is on its way');
      res.body.should.have.property('jobId');
			done();
		});
	});
  });
});
