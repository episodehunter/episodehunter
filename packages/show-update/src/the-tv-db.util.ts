import { TheTvDb } from '@episodehunter/thetvdb';

const theTvDb = new TheTvDb(process.env.THE_TV_DB_API_KEY);

export const getInformationFromTvDb = (theTvDbId: number) =>
  Promise.all([theTvDb.fetchShow(theTvDbId), theTvDb.fetchShowEpisodes(theTvDbId)]);
