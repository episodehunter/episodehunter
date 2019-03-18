const showUpdater = require('./dist/show-updater-handler');
const titlesUpdater = require('./dist/titles-updater-handler');

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

titlesUpdater.update(event, context, callback);
// showUpdater.update(event, context, callback);
