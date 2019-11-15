const { updateAllShows } = require('./dist/handler');

const context = {
  awsRequestId: 'local'
};

updateAllShows(context, console)
  .then(() => console.log('Done and done'))
  .catch(error => console.error(error));
