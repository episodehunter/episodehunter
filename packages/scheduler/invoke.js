const handler = require('./dist/handler');

const event = null;

const timeout = Date.now() + 60 * 60 * 1000;

function timeLeft() {
  return timeout - Date.now();
}

const context = {
  functionName: 'showDelegator-local',
  getRemainingTimeInMillis: timeLeft
};

const callback = (error, result) => console.log(error, result);
handler.update(event, context, callback);
