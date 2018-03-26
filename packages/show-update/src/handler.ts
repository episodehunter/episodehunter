import { guard, assertRequiredConfig } from '@episodehunter/kingsguard';
import { TooManyEpisodes } from '@episodehunter/thetvdb';
import { SNSEvent } from 'aws-lambda';
import { updateShow, addShow } from './update-show';
import { InsufficientShowInformation } from './custom-erros';

assertRequiredConfig('EH_RED_KEEP_URL', 'EH_RED_API_KEY', 'THE_TV_DB_API_KEY');

export const update = guard<SNSEvent>(function updateInner(event, logger) {
  const message = event.Records[0].Sns.Message;
  const theTvDbId = Number(message) | 0;

  logger.log(`Will update the show with theTvDbId: ${theTvDbId} and associated epesodes`);

  if (theTvDbId <= 0) {
    throw new Error('theTvDbId is not a valid id:' + message);
  }

  return updateShow(logger, theTvDbId).catch((error: Error) => {
    if (error instanceof TooManyEpisodes || error instanceof InsufficientShowInformation) {
      return Promise.resolve('Error but OK: ' + error.message);
    }
    return Promise.reject(error);
  });
});

export const add = guard<{ theTvDbId: number }>(function updateAdd(event, logger) {
  const theTvDbId = event.theTvDbId | 0;

  logger.log(`Will add the show with theTvDbId: ${theTvDbId} and associated epesodes`);

  if (theTvDbId <= 0) {
    throw new Error('theTvDbId is not a valid id:' + event.theTvDbId);
  }

  return addShow(logger, theTvDbId);
});
