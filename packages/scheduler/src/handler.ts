import { createGuard } from '@episodehunter/kingsguard';
import { config } from './config';
import { getShowsToUpdate, publishShowUpdate } from './dragonstone.util';

const guard = createGuard(config.sentryDns, config.logdnaKey);

export const updateOldestShows = guard(async (_, logger, contenxt) => {
  logger.track({ type: 'event', category: 'schedular-show-update', action: 'start mass update' });
  logger.log('Start a mass update of the oldest shows to show-update');
  const oldestShows = await getShowsToUpdate(contenxt.awsRequestId);
  if (oldestShows.length === 0) {
    logger.track({ type: 'event', category: 'show-update', action: 'nothing to update' });
    logger.log('Nothing to update. Will return');
    return 0;
  }
  logger.log('Will update: ' + oldestShows.map(s => s.name).join(', '));
  const result = await Promise.all(oldestShows.map(show => publishShowUpdate(show)));
  logger.log('We are done with mass update of the oldest shows to show-update');
  return result.length;
});
