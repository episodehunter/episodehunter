import { guard, assertRequiredConfig } from '@episodehunter/kingsguard';
import { SNSEvent } from 'aws-lambda';
import { updateShow } from './update-show';
import { TooManyEpisodes, InsufficientShowInformation } from './custom-erros';

assertRequiredConfig('EH_RED_KEEP_URL', 'EH_RED_KEEP_TOKEN', 'THE_TV_DB_API_KEY', 'THE_TV_DB_USER_KEY');

export const update = guard<SNSEvent>(function updateInner(event, logger) {
  const message = event.Records[0].Sns.Message;
  const theTvDbId = Number(message) | 0;

  logger.log(`Will update the show with theTvDbId: ${theTvDbId} and associated epesodes`);

  if (theTvDbId <= 0) {
    throw new Error('theTvDbId is not a valid id:' + message);
  }

  return updateShow(logger, theTvDbId).catch((error: Error) => {
    if (error instanceof TooManyEpisodes || error instanceof InsufficientShowInformation) {
      logger.captureException(error);
      return Promise.resolve('Error but OK');
    }
    return Promise.reject(error);
  });
});
