import { createGuard } from '@episodehunter/kingsguard';
import { TooManyEpisodes } from '@episodehunter/thetvdb';
import { Message } from '@episodehunter/types';
import { SNSEvent } from 'aws-lambda';
import { config } from './config';
import { InsufficientShowInformation } from './custom-erros';
import { addShow, updateShow } from './update-show';

const guard = createGuard(config.sentryDsn, config.logdnaKey);

export const update = guard<SNSEvent>(async (event, logger, context) => {
  const message = event.Records[0].Sns.Message;
  let ids: Message.UpdateShow.UpdateShow.Event;
  try {
    ids = JSON.parse(message);
  } catch (error) {
    logger.log(`Could not parse show id from ` + message);
    throw error;
  }
  if (!ids.id || !ids.tvdbId || !ids.lastupdated) {
    throw new Error('theTvDbId, id or lastupdated is not a valid id: ' + message);
  }
  logger.log(`Will update the show (id=${ids.id}, theTvDbId=${ids.tvdbId}) and associated epesodes`);

  try {
    return await updateShow(ids, logger, context.awsRequestId);
  } catch (error) {
    logger.warn(error && error.message);
    if (error instanceof TooManyEpisodes || error instanceof InsufficientShowInformation) {
      return Promise.resolve('Error but OK: ' + error.message);
    }
    return Promise.reject(error);
  }
});

export const add = guard<Message.UpdateShow.AddShow.Event>(
  async (event, logger, context): Promise<Message.UpdateShow.AddShow.Response> => {
    const theTvDbId = event.theTvDbId | 0;

    logger.log(`Will add the show with theTvDbId: ${theTvDbId} and associated epesodes`);

    if (theTvDbId <= 0) {
      throw new Error('theTvDbId is not a valid id:' + event.theTvDbId);
    }

    return addShow(theTvDbId, logger, context.awsRequestId);
  }
);
