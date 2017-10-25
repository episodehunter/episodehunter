import { connect, Connection, entities } from '@episodehunter/datastore';
import { SNSEvent, Context, Callback } from 'aws-lambda';
import { TheTvDbShow } from './types/the-tv-db-show';
import { TheTvDbShowEpisode } from './types/the-tv-db-show-episode';
import { getTheTvDbToken, getTvDbShow, getTvDbShowEpisodes, getInformationFromTvDb } from './the-tv-db.util';
import { updateEpisodes, updateShowInDb } from './update-show';
import { ImageAction } from './types/image-action';
import { assertRequiredConfig, unixtimestamp } from './util';
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
  console.log(`Updated ${updatedEpisodes.length} episodes. Removed ${removedEpisodes.length} episodes`);
}

export async function update(event: SNSEvent, context: Context, callback: Callback) {
  const message = event.Records[0].Sns.Message;
  const theTvDbId = Number(message) | 0;

  console.log(`Will update the show with theTvDbId: ${theTvDbId} and associated epesodes`);

  if (theTvDbId <= 0) {
    const error = new Error('theTvDbId is not a valid id:' + message);
    logger.captureException(error);
    callback(error);
  }

  let connection: Connection;

  try {
    console.log('Get a connection');
    console.time('connection');
    connection = await connect({
      database: process.env.EH_DB_DATABASE,
      host: process.env.EH_DB_HOST,
      password: process.env.EH_DB_PASSWORD,
      port: process.env.EH_DB_PORT,
      username: process.env.EH_DB_USERNAME,
      ssl: null
    });
    console.timeEnd('connection');
    await updateShowAndEpisodes(theTvDbId, connection);
    callback(null, true);
  } catch (error) {
    logger.captureException(error);
    callback(error);
  } finally {
    if (connection && connection.close) {
      connection.close();
    }
  }
}
