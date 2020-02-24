import { createGuard } from '@episodehunter/kingsguard';
import { NotFound } from '@episodehunter/thetvdb';
import { Message } from '@episodehunter/types';
import { SNSEvent } from 'aws-lambda';
import { config } from './config';
import { InsufficientShowInformation } from './custom-erros';
import { addShow, updateShow } from './update-show';

const guard = createGuard(config.sentryDsn, config.logdnaKey);

export const update = guard<SNSEvent>(async (event, logger, context) => {
  logger.track({ type: 'event', category: 'show-update', action: 'update' });
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
  logger.log(`Will update the show ${ids.name} (id=${ids.id}, theTvDbId=${ids.tvdbId}) and associated epesodes`);

  try {
    return await updateShow(ids, logger, context.awsRequestId);
  } catch (error) {
    if (error instanceof InsufficientShowInformation || error instanceof NotFound) {
      error.message += ` For show ${ids.name}. id=${ids.id}, tvdbId=${ids.tvdbId}`;
      logger.captureException(error);
      return Promise.resolve('Error but OK: ' + error.message);
    }
    return Promise.reject(error);
  }
});

export const add = guard<Message.UpdateShow.AddShow.Event>(
  async (event, logger, context): Promise<Message.UpdateShow.AddShow.Response> => {
    logger.track({ type: 'event', category: 'show-add', action: 'add' });
    const theTvDbId = event.theTvDbId | 0;

    logger.log(`Will add the show with theTvDbId: ${theTvDbId} and associated epesodes`);

    if (theTvDbId <= 0) {
      throw new Error('theTvDbId is not a valid id:' + event.theTvDbId);
    }

    return addShow(theTvDbId, logger, context.awsRequestId);
  }
);
