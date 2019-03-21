import { Logger } from '@episodehunter/kingsguard';
import { TheTvDb } from '@episodehunter/thetvdb';
import { config } from './config';

const theTvDb = new TheTvDb(config.theTvDbApiKey);

export const getInformationFromTvDb = (theTvDbId: number, logger: Logger) =>
  Promise.all([
    theTvDb.fetchShow(theTvDbId, msg => logger.log(msg)),
    theTvDb.fetchShowEpisodes(theTvDbId, undefined, msg => logger.log(msg))
  ]);
