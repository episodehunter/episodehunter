process.env.NODE_ENV = 'develop';

const { createServer } = require('http');
const url = require('url');
const { graphqlHandler } = require('./dist/handler');

createServer((req, res) => {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });

  req.on('end', () => {
    const urlObject = url.parse(req.url, true);
    const event = {
      httpMethod: req.method,
      body: data,
      path: req.url,
      queryStringParameters: urlObject.query,
      requestContext: {
        path: urlObject.pathname
      },
      headers: req.headers
    };
    const callback = (error, result) => {
      if (error) throw error;
      res.statusCode = result.statusCode;
      for (let key in result.headers) {
        if (result.headers.hasOwnProperty(key)) {
          res.setHeader(key, result.headers[key]);
        }
      }
      res.write(result.body);
      res.end();
    };
    graphqlHandler(event, {}, callback);
  });
}).listen(8080, () => {
  console.log('🚀 at 8080');
});
