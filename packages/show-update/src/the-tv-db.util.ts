import { Logger } from '@episodehunter/kingsguard';
import { TheTvDb } from '@episodehunter/thetvdb';

const theTvDb = new TheTvDb(process.env.THE_TV_DB_API_KEY);

export const getInformationFromTvDb = (theTvDbId: number, logger: Logger) =>
  Promise.all([
    theTvDb.fetchShow(theTvDbId, msg => logger.log(msg)),
    theTvDb.fetchShowEpisodes(theTvDbId, undefined, msg => logger.log(msg))
  ]);
