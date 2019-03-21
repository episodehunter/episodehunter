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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

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
    graphqlHandler(event, { functionName: 'dragonstone-local', getRemainingTimeInMillis: () => 1000000 }, callback);
  });
}).listen(8080, () => {
  console.log('🚀 at 8080');
});
