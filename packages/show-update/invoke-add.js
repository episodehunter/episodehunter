console.time('loading');
const handler = require('./dist/handler');
console.timeEnd('loading');

const data = 360893; // theTvDbId

const event = { theTvDbId: data, requestStack: ['local'] };

const timeout = Date.now() + 15000;

function timeLeft() {
  return timeout - Date.now();
}

const context = {
  functionName: 'showAdd-local',
  getRemainingTimeInMillis: timeLeft
};

const callback = (error, result) => console.log(error, result);
handler.add(event, context, callback);
