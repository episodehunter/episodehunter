import { createGuard } from '@episodehunter/kingsguard';
import { TheTvDbUpdatedShowId } from '@episodehunter/types/thetvdb';
import { config } from './config';
import { getTitles } from './dragonstone.util';
import { publishShowUpdate } from './sns';
import { theTvDb } from './the-tv-db.util';
import { Title } from './types';

function unixtimestamp() {
  return (Date.now() / 1000) | 0;
}

const twoHours = 7200;

function findShowsToUpdate(titles: Title[], theTvDbIds: TheTvDbUpdatedShowId[]) {
  return theTvDbIds.map(idAndTime => titles.find(title => title.tvdbId === idAndTime.id)).filter(Boolean);
}

const guard = createGuard(config.sentryDns, config.logdnaKey);

export const update = guard(async (event, logger, context) => {
  logger.log('Start a mass update of shows to dragonstone');
  const twoHoursAgo = unixtimestamp() - twoHours;
  const [titles, theTvDbUpdates] = await Promise.all([
    getTitles(context, logger),
    theTvDb.fetchLastUpdateShowsList(twoHoursAgo, msg => logger.log(msg))
  ]);
  const showsToUpdate = findShowsToUpdate(titles, theTvDbUpdates);
  logger.log(`We should update ${showsToUpdate.length} shows`);
  const result = await Promise.all(showsToUpdate.map(title => publishShowUpdate(title)));
  logger.log('We are done with mass update of shows to dragonstone');
  return result.length;
});
