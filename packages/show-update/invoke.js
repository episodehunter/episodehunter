console.time('loading');
const handler = require('./dist/handler');
console.timeEnd('loading');

const data = 121361; // theTvDbId

const event = {
  Records: [
    {
      Sns: {
        Message: data
      }
    }
  ]
};

const context = {
  functionName: 'showUpdate-local',
  getRemainingTimeInMillis: () => 10000
};

const callback = (error, result) => console.log(error, result);
handler.update(event, context, callback);
