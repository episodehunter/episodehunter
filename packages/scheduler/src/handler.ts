import { guard, assertRequiredConfig } from '@episodehunter/kingsguard';
import { TheTvDbUpdatedShowId } from '@episodehunter/types/thetvdb';
import { getLastUpdateShows } from './the-tv-db.util';
import { getExistingShows } from './red-keep.util';
import { publishUpdateShow } from './sns';

assertRequiredConfig('EH_RED_KEEP_URL', 'EH_RED_KEEP_TOKEN', 'THE_TV_DB_API_KEY', 'THE_TV_DB_USER_KEY', 'EH_SNS_UPDATE_SHOW');

function* groupIds(ids: TheTvDbUpdatedShowId[]) {
  while (ids.length > 0) {
    yield ids.splice(0, 100).map(id => id.id);
  }
}

async function emitUpdates(): Promise<number> {
  const twoHoursAgo = unixtimestamp() - twoHours;
  const ids = await getLastUpdateShows(twoHoursAgo);

  const publishingUpdateShows: Array<Promise<any>> = [];

  for (const idGroup of groupIds(ids)) {
    const showsToUpdate = await getExistingShows(idGroup);
    publishingUpdateShows.push(...showsToUpdate.map(show => publishUpdateShow(show.tvdbId)));
  }

  await Promise.all(publishingUpdateShows);
  return publishingUpdateShows.length;
}

function unixtimestamp() {
  return (Date.now() / 1000) | 0;
}

const twoHours = 7200;

export const update = guard(function updateInner(event, logger) {
  logger.log('Start a mass update of shows');
  return emitUpdates();
});
