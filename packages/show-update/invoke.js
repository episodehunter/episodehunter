console.time('loading');
const handler = require('./dist/handler');
console.timeEnd('loading');

const data = 73388; // theTvDbId

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
  getRemainingTimeInMillis: timeLeft
};

const callback = (error, result) => console.log(error, result);
handler.update(event, context, callback);
