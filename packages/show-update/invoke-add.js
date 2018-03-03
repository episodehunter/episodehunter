console.time('loading');
const handler = require('./dist/handler');
console.timeEnd('loading');

const data = 80379; // theTvDbId
// const data = 121361; // theTvDbId, game of throes

const event = { theTvDbId: data };

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
