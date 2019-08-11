import { createGuard, Logger } from '@episodehunter/kingsguard';
import { TheTvDbUpdatedShowId } from '@episodehunter/thetvdb';
import { Event as ShowToUpdate } from '@episodehunter/types/message/show-update/update-show';
import { unixTimestamp } from '@episodehunter/utils';
import { config } from './config';
import { getTitles, publishShowUpdate } from './dragonstone.util';
import { theTvDb } from './the-tv-db.util';
import { Title } from './types';

const twoHours = 7200;

function findShowsToUpdate(titles: Title[], theTvDbIds: TheTvDbUpdatedShowId[], logger: Logger): ShowToUpdate[] {
  const showsToUpdate: ShowToUpdate[] = [];

  for (let idAndTime of theTvDbIds) {
    const showMatch = titles.find(title => title.tvdbId === idAndTime.id);
    if (!showMatch) {
      continue;
    } else if (showMatch.lastupdated < idAndTime.lastUpdated) {
      showsToUpdate.push({
        id: showMatch.id,
        lastupdated: idAndTime.lastUpdated,
        tvdbId: idAndTime.id
      });
    } else if (showMatch.lastupdated > idAndTime.lastUpdated) {
      logger.warn(
        `The tv db says ${showMatch.id} should update, but we have a newer version. ${showMatch.lastupdated} > ${
          idAndTime.lastUpdated
        } == true`
      );
    }
  }

  return showsToUpdate;
}

const guard = createGuard(config.sentryDns, config.logdnaKey);

export const update = guard(async (event, logger, context) => {
  logger.log('Start a mass update of shows to dragonstone');
  const twoHoursAgo = unixTimestamp() - twoHours;
  const [titles, theTvDbUpdates] = await Promise.all([
    getTitles(context, logger),
    theTvDb.fetchLastUpdateShowsList(twoHoursAgo, (msg: string) => logger.log(msg))
  ]);
  const showsToUpdate = findShowsToUpdate(titles, theTvDbUpdates, logger);
  logger.log(`We should update ${showsToUpdate.length} shows`);
  const result = await Promise.all(showsToUpdate.map(title => publishShowUpdate(title)));
  logger.log('We are done with mass update of shows to dragonstone');
  return result.length;
});
