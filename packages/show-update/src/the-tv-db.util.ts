import { Logger } from '@episodehunter/kingsguard';
import { TheTvDb } from '@episodehunter/thetvdb';
import { config } from './config';

const theTvDb = new TheTvDb(config.theTvDbApiKey);

export const fetchShow = (theTvDbId: number, logger: Logger) => theTvDb.fetchShow(theTvDbId, msg => logger.log(msg));
export const fetchShowEpisodes = (theTvDbId: number, logger: Logger) =>
  theTvDb.fetchShowEpisodes(theTvDbId, undefined, msg => logger.log(msg));
export const getInformationFromTvDb = (theTvDbId: number, logger: Logger) =>
  Promise.all([fetchShow(theTvDbId, logger), fetchShowEpisodes(theTvDbId, logger)]);
