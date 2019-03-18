import { createGuard, Logger } from '@episodehunter/kingsguard';
import { TheTvDbUpdatedShowId } from '@episodehunter/types/thetvdb';
import { Context } from 'aws-lambda';
import { config } from './config';
import { getExistingShows } from './red-keep.util';
import { publishUpdateShow } from './sns';
import { theTvDb } from './the-tv-db.util';

function* groupIds(ids: TheTvDbUpdatedShowId[]) {
  while (ids.length > 0) {
    yield ids.splice(0, 100).map(id => id.id);
  }
}

async function emitUpdates(logger: Logger, context: Context): Promise<number> {
  const twoHoursAgo = unixtimestamp() - twoHours;
  logger.log(`Get list of shows to update`);
  const ids = await theTvDb.fetchLastUpdateShowsList(twoHoursAgo);

  const publishingUpdateShows: Array<Promise<any>> = [];

  for (const idGroup of groupIds(ids)) {
    logger.log(`Check if shows exists in db. Length: ${idGroup.length}`);
    const showsToUpdate = await getExistingShows(idGroup, context);
    logger.log(`Publish shows to update. length: ${showsToUpdate.length}`);
    publishingUpdateShows.push(...showsToUpdate.map(show => publishUpdateShow(show.tvdbId)));
  }

  logger.log(`Waiting for sns publish. Length: ${publishingUpdateShows.length}`);
  await Promise.all(publishingUpdateShows);
  return publishingUpdateShows.length;
}

function unixtimestamp() {
  return (Date.now() / 1000) | 0;
}

const twoHours = 7200;

const guard = createGuard(config.sentryDns, config.logdnaKey);

export const update = guard((event, logger, context) => {
  logger.log('Start a mass update of shows');
  const result = emitUpdates(logger, context);
  logger.log('We are done. Result: ' + result);
  return result;
});
