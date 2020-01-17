import { createGuard, Logger } from '@episodehunter/kingsguard';
import { TheTvDbUpdatedShowId } from '@episodehunter/thetvdb';
import { Message } from '@episodehunter/types';
import { unixTimestamp } from '@episodehunter/utils';
import { config } from './config';
import { getTitles, getShowsToUpdate, publishShowUpdate } from './dragonstone.util';
import { theTvDb } from './the-tv-db.util';
import { Title } from './types';

const twoHours = 7200;

function findShowsToUpdate(
  titles: Title[],
  theTvDbIds: TheTvDbUpdatedShowId[],
  logger: Logger
): Message.UpdateShow.UpdateShow.Event[] {
  const showsToUpdate: Message.UpdateShow.UpdateShow.Event[] = [];

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
        `The tv db says ${showMatch.id} should update, but we have a newer version. ${showMatch.lastupdated} > ${idAndTime.lastUpdated} == true`
      );
    }
  }

  return showsToUpdate;
}

const guard = createGuard(config.sentryDns, config.logdnaKey);

export const updateOldestShows = guard(async (_, logger) => {
  logger.log('Start a mass update of the oldest shows to show-update');
  const oldestShows = await getShowsToUpdate();
  const result = await Promise.all(oldestShows.map(show => publishShowUpdate(show)));
  logger.log('We are done with mass update of the oldest shows to show-update');
  return result.length;
});

export const update = guard(async (_, logger, context) => {
  logger.log('Start a mass update of shows to show-update');
  const twoHoursAgo = unixTimestamp() - twoHours;
  const [titles, theTvDbUpdates] = await Promise.all([
    getTitles(context, logger),
    theTvDb.fetchLastUpdateShowsList(twoHoursAgo, (msg: string) => logger.log(msg))
  ]);
  const showsToUpdate = findShowsToUpdate(titles, theTvDbUpdates, logger);
  logger.log(`We should update ${showsToUpdate.length} shows`);
  const result = await Promise.all(showsToUpdate.map(title => publishShowUpdate(title)));
  logger.log('We are done with mass update of shows to show-update');
  return result.length;
});

export const updateAllShows = async (context: { awsRequestId: string }, logger: Pick<Logger, 'log'>) => {
  logger.log('Start a mass update all shows to show-update');
  const showsToUpdate: Title[] = await getTitles(context, logger);
  logger.log(`We should update ${showsToUpdate.length} shows`);
  const sleep = () => new Promise(r => setTimeout(r, 2000));
  showsToUpdate.sort((a, b) => a.id - b.id)
  for (const title of showsToUpdate) {
    if (title.id <= 5000) {
      continue;
    } else if (title.id >= 7000) {
      break;
    }
    console.log('Update ' + title.id)
    await sleep();
    await publishShowUpdate(title);
    console.log('Publish ' + title.id)
  }
  logger.log('We are done with mass update of shows to show-update');
  return showsToUpdate.length;
};
