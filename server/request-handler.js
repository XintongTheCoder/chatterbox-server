/* eslint-disable indent */
/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
let messages = [];
let messageId = 0;
const fs = require('fs');
const path = require('path');

const requestHandler = function (request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  // eslint-disable-next-line no-use-before-define
  let headers = defaultCorsHeaders;
  if (request.url === '/classes/messages') {
    console.log(
      'Serving request type ' + request.method + ' for url ' + request.url
    );
    // See the note below about CORS headers.
    // eslint-disable-next-line no-use-before-define
    headers['Content-Type'] = 'application/json';
    // Handle POST request
    switch (request.method) {
      case 'GET':
        // .writeHead() writes to the request line and headers of the response,
        // which includes the status and all headers.
        response.writeHead(200, headers);
        // Make sure to always call response.end() - Node may not send
        // anything back to the client until you do. The string you pass to
        // response.end() will be the body of the response - i.e. what shows
        // up in the browser.
        //
        // Calling .end "flushes" the response's internal buffer, forcing
        // node to actually send all the data over to the client.
        response.end(JSON.stringify(messages));
        break;
      case 'POST':
        let body = [];
        request
          .on('data', (chunk) => {
            body.push(chunk);
          })
          .on('end', () => {
            body = Buffer.concat(body).toString();
            const bodyObj = JSON.parse(body);
            bodyObj['message_id'] = messageId++;
            console.log('###', bodyObj);
            messages.push(bodyObj);
            response.writeHead(201, headers);
            response.end(JSON.stringify(bodyObj));
          });
        break;
      case 'OPTIONS':
        headers['Allow'] = 'GET, POST';
        response.writeHead(200, headers);
        response.end();
        break;
    }
  } else if (request.url === '/' || request.url.includes('/?username=')) {
    fs.readFile(path.join(__dirname, '../chatterbox.html'), (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end('404 Not Found');
      } else {
        headers['Content-Type'] = 'text/html';
        response.writeHead(200, headers);
        response.end(data);
      }
    });
  } else if (request.url.includes('css') || request.url.includes('js')) {
    fs.readFile(path.join(__dirname, '..', request.url), (error, data) => {
      if (error) {
        response.writeHead(404);
        response.end('404 Not Found');
      } else {
        if (request.url.includes('css')) {
          headers['Content-Type'] = 'text/css';
        } else {
          headers['Content-Type'] = 'application/javascript';
        }
        response.writeHead(200, headers);
        response.end(data);
      }
    });
  } else {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('404 Not Found');
  }
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
const defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, authorization',
  'access-control-max-age': 10, // Seconds.
};

module.exports.requestHandler = requestHandler;
