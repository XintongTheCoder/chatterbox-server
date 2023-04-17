const handler = require('../request-handler');
const expect = require('chai').expect;
const stubs = require('./Stubs');

describe('Node Server Request Listener Function', function () {
  it('Should answer GET requests for /classes/messages with a 200 status code', function () {
    // This is a fake server request. Normally, the server would provide this,
    // but we want to test our function's behavior totally independent of the server code
    const req = new stubs.request('/classes/messages', 'GET');
    const res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    expect(res._ended).to.equal(true);
  });

  it('Should send back parsable stringified JSON', function () {
    const req = new stubs.request('/classes/messages', 'GET');
    const res = new stubs.response();

    handler.requestHandler(req, res);

    expect(JSON.parse.bind(this, res._data)).to.not.throw();
    expect(res._ended).to.equal(true);
  });

  it('Should send back an array', function () {
    const req = new stubs.request('/classes/messages', 'GET');
    const res = new stubs.response();

    handler.requestHandler(req, res);

    const parsedBody = JSON.parse(res._data);
    expect(parsedBody).to.be.an('array');
    expect(res._ended).to.equal(true);
  });

  it.only('Should accept posts to /classes/messages', function () {
    const stubMsg = {
      username: 'Jono',
      text: 'Do my bidding!',
    };
    const req = new stubs.request('/classes/messages', 'POST', stubMsg);
    const res = new stubs.response();

    handler.requestHandler(req, res);

    // Expect 201 Created response status
    expect(res._responseCode).to.equal(201);

    // Testing for a newline isn't a valid test
    // TODO: Replace with with a valid test
    // expect(res._data).to.equal(JSON.stringify('\n'));
    expect(res._ended).to.equal(true);
  });

  it('Should respond with messages that were previously posted', function () {
    const stubMsg = {
      username: 'Jono',
      text: 'Do my bidding!',
    };
    let req = new stubs.request('/classes/messages', 'POST', stubMsg);
    let res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(201);

    // Now if we request the log for that room the message we posted should be there:
    req = new stubs.request('/classes/messages', 'GET');
    res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    const messages = JSON.parse(res._data);
    const length = messages.length;
    expect(length).to.be.above(0);
    expect(messages[length - 1].username).to.equal('Jono');
    expect(messages[length - 1].text).to.equal('Do my bidding!');
    expect(res._ended).to.equal(true);
  });

  it('Should store received messages on server', function () {
    const stubMsg1 = {
      username: 'Huahua',
      text: 'Duo Sun La!',
    };
    let req = new stubs.request('/classes/messages', 'POST', stubMsg1);
    let res = new stubs.response();

    handler.requestHandler(req, res);

    const stubMsg2 = {
      username: 'Heye',
      text: 'Qi Lai Hi!',
    };
    req = new stubs.request('/classes/messages', 'POST', stubMsg2);
    res = new stubs.response();

    handler.requestHandler(req, res);

    req = new stubs.request('/classes/messages', 'GET');
    res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    const messages = JSON.parse(res._data);
    const length = messages.length;

    expect(messages[length - 2].username).to.equal('Huahua');
    expect(messages[length - 2].text).to.equal('Duo Sun La!');
    expect(messages[length - 1].username).to.equal('Heye');
    expect(messages[length - 1].text).to.equal('Qi Lai Hi!');
    expect(res._ended).to.equal(true);
  });

  it('Should 404 when asked for a nonexistent file', function () {
    const req = new stubs.request('/arglebargle', 'GET');
    const res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(404);
    expect(res._ended).to.equal(true);
  });

  it('Should handle OPTIONS requests', function () {
    const req = new stubs.request('/classes/messages', 'OPTIONS');
    const res = new stubs.response();

    handler.requestHandler(req, res);
    expect(res._responseCode).to.equal(200);
    expect(res._headers['Allow']).to.equal('GET, POST');
    expect(res._ended).to.equal(true);
  });
});
