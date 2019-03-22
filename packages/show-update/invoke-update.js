console.time('loading');
const handler = require('./dist/dragonstone/handler');
console.timeEnd('loading');

// Game of Throes
const data = JSON.stringify({
  id: '10',
  tvdb: 121361
});

const event = {
  Records: [
    {
      Sns: {
        Message: data
      }
    }
  ]
};

const timeout = Date.now() + 15000;

function timeLeft() {
  return timeout - Date.now();
}

const context = {
  functionName: 'showUpdate-local',
  getRemainingTimeInMillis: timeLeft,
  awsRequestId: 22
};

const callback = (error, result) => console.log(error, result);
handler.update(event, context, callback);
