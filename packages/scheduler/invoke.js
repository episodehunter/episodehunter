const handler = require('./dist/handler');

function callback(error, data) {
  if (error) {
    throw error;
  }
  console.log(data);
}

handler.update(null, null, callback);
