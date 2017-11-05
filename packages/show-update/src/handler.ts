import { guard, assertRequiredConfig } from '@episodehunter/kingsguard';
import { SNSEvent } from 'aws-lambda';
import { getInformationFromTvDb } from './the-tv-db.util';
import { updateEpisodes, updateShowInDb } from './update-show';

assertRequiredConfig(
  'EH_DB_HOST',
  'EH_DB_PORT',
  'EH_DB_USERNAME',
  'EH_DB_PASSWORD',
  'EH_DB_DATABASE',
  'THE_TV_DB_API_KEY',
  'THE_TV_DB_USER_KEY'
);

export const update = guard<SNSEvent>(async function updateInner(event, logger, connect) {
  const message = event.Records[0].Sns.Message;
  const theTvDbId = Number(message) | 0;

  logger.log(`Will update the show with theTvDbId: ${theTvDbId} and associated epesodes`);

  if (theTvDbId <= 0) {
    throw new Error('theTvDbId is not a valid id:' + message);
  }

  const connection = await connect();
  const [tShow, tEpisodes] = await getInformationFromTvDb(theTvDbId);
  const show = await updateShowInDb(connection, logger, tShow);
  const { addedEpisodes, removedEpisodes, updatedEpisodes } = await updateEpisodes(
    connection,
    logger,
    show.id,
    theTvDbId,
    tEpisodes
  );
  logger.log(`Added ${addedEpisodes}, updated: ${updatedEpisodes} and removed ${removedEpisodes} episodes`);
  return true;
});
