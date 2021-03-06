import { Logger } from '@episodehunter/kingsguard';
import { TheTvDb, NotFound } from '@episodehunter/thetvdb';
import { Tmdb } from '@episodehunter/tmdb';
import { config } from './config';

const theTvDb = new TheTvDb(config.theTvDbApiKey, {
  timeout: 8000,
  nextTimeout: t => {
    if (t >= 10000) {
      return null;
    }
    return t + 2000
  }
});
const tmdb = new Tmdb(config.tmdbApiKey);

export const fetchShow = (theTvDbId: number, logger: Logger) => theTvDb.fetchShow(theTvDbId, msg => logger.log(msg));
export const fetchShowEpisodes = (theTvDbId: number, logger: Logger) => theTvDb.fetchShowEpisodes(theTvDbId, msg => logger.log(msg));
export const fetchLatestShowEpisodes = (theTvDbId: number, logger: Logger) => theTvDb.fetchLatestShowEpisodes(theTvDbId, 50, msg => logger.log(msg));

/**
 * Get all information there is about a show.
 */
export const getInformationFromTvDb = async (externalShowId: number, logger: Logger) => {
  const getShow = (id: number) => Promise.all([fetchShow(id, logger), fetchShowEpisodes(id, logger)]);
  try {
    return await getShow(externalShowId);
  } catch (error) {
    if (error instanceof NotFound) {
      const thetvdb = await tmdb.getTheTvDbId(externalShowId, msg => logger.log(msg));
      if (!thetvdb) {
        throw new NotFound(`Could not found ${externalShowId}. Nor on thetvdb or tmdb`);
      }
      return await getShow(thetvdb);
    }
    throw error;
  }
};
