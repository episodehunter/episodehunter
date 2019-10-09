process.env.EH_RAVEN_DSN = '';
process.env.EH_RAVEN_PROJECT = '';
process.env.THE_TV_DB_API_KEY = process.argv[2];
process.env.BUCKET_NAME = process.argv[3];
process.env.BUCKET_URL = process.argv[4] || 'https://d1lolx4ilifvdr.cloudfront.net';
const key = process.argv[5] || '/poster/80379.jpg';

const handler = require('./handler');

const customEvent = {
  queryStringParameters: {
    key
  }
};

const logger = {
  log(...msgs: string[]) {
    console.log(...msgs);
  }
};

handler
  .imageFetcher(customEvent, logger)
  .then((result: any) => console.log(result))
  .catch((error: any) => console.error(error));
