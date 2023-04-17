/* eslint-disable no-use-before-define */
/* eslint-disable indent */
/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
const path = require('path');
const urlParser = require('url');
const {
  defaultCorsHeaders,
  send404,
  sendResponse,
  collectData,
  sendFile,
} = require('./utils.js');
let messages = [];
let messageId = 0;

// Routing logic
module.exports = function (request, response) {
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
  const url = urlParser.parse(request.url).pathname; // to exclude query parameter
  if (url === '/classes/messages') {
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
        // response.writeHead(200, headers);
        // Make sure to always call response.end() - Node may not send
        // anything back to the client until you do. The string you pass to
        // response.end() will be the body of the response - i.e. what shows
        // up in the browser.
        //
        // Calling .end "flushes" the response's internal buffer, forcing
        // node to actually send all the data over to the client.
        // response.end(JSON.stringify(messages));
        sendResponse(response, 200, headers, JSON.stringify(messages));
        break;
      case 'POST':
        collectData(request, (message) => {
          message['message_id'] = messageId++;
          messages.push(message);
          sendResponse(response, 201, headers, JSON.stringify(message));
        });
        break;
      case 'OPTIONS':
        headers['Allow'] = 'GET, POST';
        sendResponse(response, 200, headers);
        break;
    }
  } else if (url === '/') {
    sendFile(
      path.join(__dirname, '../chatterbox.html'),
      'html',
      headers,
      response
    );
  } else if (url.includes('css')) {
    sendFile(path.join(__dirname, '..', url), 'css', headers, response);
  } else if (url.includes('js')) {
    sendFile(path.join(__dirname, '..', url), 'js', headers, response);
  } else {
    send404(response);
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

// module.exports.requestHandler = requestHandler;
