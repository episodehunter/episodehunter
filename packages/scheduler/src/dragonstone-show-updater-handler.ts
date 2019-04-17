import { createGuard, Logger } from '@episodehunter/kingsguard';
import { TheTvDbUpdatedShowId } from '@episodehunter/thetvdb';
import { config } from './config';
import { getTitles } from './dragonstone.util';
import { publishShowUpdate } from './sns';
import { theTvDb } from './the-tv-db.util';
import { Title } from './types';

function unixtimestamp() {
  return (Date.now() / 1000) | 0;
}

const twoHours = 7200;

function findShowsToUpdate(titles: Title[], theTvDbIds: TheTvDbUpdatedShowId[], logger: Logger) {
  // This functions is complex due to we want to log if we find the show but dont want to update
  return theTvDbIds
    .map(idAndTime => {
      const showMatch = titles.find(title => title.tvdbId === idAndTime.id);
      if (showMatch) {
        if (showMatch.lastupdated < idAndTime.lastUpdated) {
          return showMatch;
        } else {
          logger.log(
            `The tv db says ${idAndTime.id};${showMatch.id} should update, but we have a newer version. ${
              showMatch.lastupdated
            } > ${idAndTime.lastUpdated} == true`
          );
          return;
        }
      } else {
        return;
      }
    })
    .filter(Boolean);
}

const guard = createGuard(config.sentryDns, config.logdnaKey);

export const update = guard(async (event, logger, context) => {
  logger.log('Start a mass update of shows to dragonstone');
  const twoHoursAgo = unixtimestamp() - twoHours;
  const [titles, theTvDbUpdates] = await Promise.all([
    getTitles(context, logger),
    theTvDb.fetchLastUpdateShowsList(twoHoursAgo, msg => logger.log(msg))
  ]);
  const showsToUpdate = findShowsToUpdate(titles, theTvDbUpdates, logger);
  logger.log(`We should update ${showsToUpdate.length} shows`);
  const result = await Promise.all(showsToUpdate.map(title => publishShowUpdate(title)));
  logger.log('We are done with mass update of shows to dragonstone');
  return result.length;
});
