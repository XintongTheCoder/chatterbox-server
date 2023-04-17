const fs = require('fs');
exports.defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, authorization',
  'access-control-max-age': 10, // Seconds.
};

exports.send404 = (response) => {
  response.writeHead(404, { 'Content-Type': 'text/plain' });
  response.end('404 Not Found');
};

exports.sendResponse = (response, statusCode = 200, headers = {}, payload) => {
  response.writeHead(statusCode, headers);
  response.end(payload);
};

exports.collectData = (request, callback) => {
  let body = [];
  request
    .on('data', (chunk) => {
      body.push(chunk); // Or chunk.toString() to get the stringified JSON
    })
    .on('end', () => {
      body = Buffer.concat(body).toString();
      const bodyObj = JSON.parse(body);
      callback(bodyObj);
    });
};

exports.sendFile = (path, fileType, headers, response) => {
  fs.readFile(path, (error, data) => {
    if (error) {
      exports.send404(response);
    } else {
      if (fileType === 'html') {
        headers['Content-Type'] = 'text/html';
      } else if (fileType === 'css') {
        headers['Content-Type'] = 'text/css';
      } else if (fileType === 'js') {
        headers['Content-Type'] = 'application/javascript';
      }
      exports.sendResponse(response, 200, headers, data);
    }
  });
};
