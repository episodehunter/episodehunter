import { connect, Connection } from '@episodehunter/datastore';
import { SNSEvent, Context, Callback } from 'aws-lambda';
import { getInformationFromTvDb } from './the-tv-db.util';
import { updateEpisodes, updateShowInDb } from './update-show';
import { assertRequiredConfig } from './util';
import { logger } from './logger';

assertRequiredConfig(
  'EH_DB_HOST',
  'EH_DB_PORT',
  'EH_DB_USERNAME',
  'EH_DB_PASSWORD',
  'EH_DB_DATABASE',
  'THE_TV_DB_API_KEY',
  'THE_TV_DB_USER_KEY'
);

async function updateShowAndEpisodes(theTvDbId: number, db: Connection) {
  const [tShow, tEpisodes] = await getInformationFromTvDb(theTvDbId);
  const show = await updateShowInDb(db, tShow);
  const { removedEpisodes, updatedEpisodes } = await updateEpisodes(db, show.id, theTvDbId, tEpisodes);
  // updateImages(show, updatedEpisodes, removedEpisodes);
  logger.log(`Updated ${updatedEpisodes.length} episodes. Removed ${removedEpisodes.length} episodes`);
}

function assertTimeout<T>(fun: (event: T, context: Context) => any) {
  return async (event: T, context: Context, callback: Callback) => {
    const timeoutId = setTimeout(() => {
      logger.captureException(new Error(`Timeout in 500ms for ${context.functionName}`));
    }, context.getRemainingTimeInMillis() - 500);
    try {
      const result = await fun(event, context);
      callback(undefined, result);
    } catch (error) {
      logger.captureException(error);
      callback(error);
    } finally {
      clearTimeout(timeoutId);
    }
  };
}

export const update = assertTimeout(async function updateInner(event: SNSEvent, context: Context) {
  logger.install(context);
  const message = event.Records[0].Sns.Message;
  const theTvDbId = Number(message) | 0;

  logger.log(`Will update the show with theTvDbId: ${theTvDbId} and associated epesodes`);

  if (theTvDbId <= 0) {
    throw new Error('theTvDbId is not a valid id:' + message);
  }

  let connection: Connection;

  try {
    const eventEnd = logger.eventStart('connection');
    connection = await connect({
      database: process.env.EH_DB_DATABASE,
      host: process.env.EH_DB_HOST,
      password: process.env.EH_DB_PASSWORD,
      port: process.env.EH_DB_PORT,
      username: process.env.EH_DB_USERNAME,
      ssl: null
    });
    eventEnd();
    await updateShowAndEpisodes(theTvDbId, connection);
    return true;
  } finally {
    if (connection && connection.close) {
      connection.close();
    }
  }
});
