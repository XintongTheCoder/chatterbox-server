var request = require('request');
var expect = require('chai').expect;

describe('server', function () {
  it('should respond to GET requests for /classes/messages with a 200 status code', function (done) {
    request(
      'http://127.0.0.1:3000/classes/messages',
      function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        // In task Queue: it(), request()
        done(); // Without done(), it() will not know there is an async func inside of request, if expect() failed, there is no way to tell it() because it's no longer in the Queue
      }
    );
  });

  it('should send back parsable stringified JSON', function (done) {
    request(
      'http://127.0.0.1:3000/classes/messages',
      function (error, response, body) {
        expect(JSON.parse.bind(this, body)).to.not.throw();
        done();
      }
    );
  });

  it('should send back an array', function (done) {
    request(
      'http://127.0.0.1:3000/classes/messages',
      function (error, response, body) {
        var parsedBody = JSON.parse(body);
        expect(parsedBody).to.be.an('array');
        done();
      }
    );
  });

  it('should accept POST requests to /classes/messages', function (done) {
    var requestParams = {
      method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        text: 'Do my bidding!',
      },
    };

    request(requestParams, function (error, response, body) {
      expect(response.statusCode).to.equal(201);
      done();
    });
  });

  it.only('should respond with messages that were previously posted', function (done) {
    var requestParams = {
      method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        text: 'Do my bidding!',
      },
    };

    request(requestParams, function (error, response, body) {
      // Now if we request the log, that message we posted should be there:
      var messages = body;
      expect(messages.username).to.equal('Jono');
      expect(messages.text).to.equal('Do my bidding!');
      done();
    });
  });

  it('Should 404 when asked for a nonexistent endpoint', function (done) {
    request(
      'http://127.0.0.1:3000/arglebargle',
      function (error, response, body) {
        expect(response.statusCode).to.equal(404);
        done();
      }
    );
  });

  it('Should handle OPTIONS requests', function (done) {
    const requestParams = {
      method: 'OPTIONS',
      uri: 'http://127.0.0.1:3000/classes/messages',
    };
    request(requestParams, function (error, response, body) {
      expect(response.statusCode).to.equal(200);
      expect(response.headers.allow).to.equal('GET, POST');
      done();
    });
  });
});
