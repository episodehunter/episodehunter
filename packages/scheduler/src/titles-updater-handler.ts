import { createGuard } from '@episodehunter/kingsguard';
import { config } from './config';
import { updateTitles } from './dragonstone.util';

const guard = createGuard(config.sentryDns, config.logdnaKey);

export const update = guard(async (event, logger, context) => {
  logger.log('Start update titles');
  const result = await updateTitles(context).catch(error => {
    logger.log('We could not update the titles :(' + error);
    return false;
  });
  logger.log('We are done. Result: ' + result);
  return result;
});
