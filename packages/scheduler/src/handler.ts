import { connect, Connection, entities } from '@episodehunter/datastore';
import { SNSEvent, Context, Callback } from 'aws-lambda';
import * as assertRequiredConfig from 'assert-env';
import { UpdatedId } from './types/the-tv-db-updates';
import { getLastUpdateShows } from './the-tv-db.util';
import { getLastUpdated, getExistingShows, updateLastUpdate } from './database.util';
import { logger } from './logger';
import { publishUpdateShow } from './sns';

assertRequiredConfig(['EH_DB_HOST', 'EH_DB_PORT', 'EH_DB_USERNAME', 'EH_DB_PASSWORD', 'EH_DB_DATABASE']);

function* groupIds(ids: UpdatedId[]) {
  while (ids.length > 0) {
    yield ids.splice(0, 100).map(id => id.id);
  }
}

async function emitUpdates(connection: Connection): Promise<number> {
  const now = unixtimestamp();
  const lastUpdate = await getLastUpdated(connection);
  const ids = await getLastUpdateShows(lastUpdate);
  const publishingUpdateShows: Array<Promise<any>> = [];
  for (const idGroup of groupIds(ids)) {
    const showsToUpdate = await getExistingShows(connection, idGroup);
    publishingUpdateShows.concat(showsToUpdate.map(theTvDbId => publishUpdateShow(theTvDbId)));
  }
  await Promise.all(publishingUpdateShows);
  await updateLastUpdate(connection, now);
  return publishingUpdateShows.length;
}

export function unixtimestamp() {
  return (Date.now() / 1000) | 0;
}

export async function update(event: SNSEvent, context: Context, callback: Callback) {
  let connection: Connection;

  try {
    connection = await connect({
      database: process.env.EH_DB_DATABASE,
      host: process.env.EH_DB_HOST,
      password: process.env.EH_DB_PASSWORD,
      port: process.env.EH_DB_PORT,
      username: process.env.EH_DB_USERNAME
    });
    const numberOfRequestedUpdates = await emitUpdates(connection);
    callback(null, numberOfRequestedUpdates);
  } catch (error) {
    logger.captureException(error);
    callback(error);
  } finally {
    if (connection && connection.close) {
      connection.close();
    }
  }
}
