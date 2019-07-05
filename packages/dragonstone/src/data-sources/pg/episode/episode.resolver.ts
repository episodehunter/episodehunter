import { Logger } from '@episodehunter/logger';
import { Dragonstone, Message, ShowId } from '@episodehunter/types';
import { Client } from 'pg';
import { PgEpisode } from '../types';
import { createEpisodeBatch } from '../util/pg-util';
import { mapEpisode, mapEpisodeInputToEpisode, mapEpisodes } from './episode.mapper';
import { calculateEpisodeNumber } from '../../../util/util';
import { EpisodeLoader } from './episode.loader';
import { createDateString } from '../../../util/date';

export const createEpisodeResolver = (client: Client, episodeLoader: EpisodeLoader) => ({
  async getNextEpisodeToWatch(userId: number, showId: ShowId): Promise<Dragonstone.Episode | null> {
    const dbResult = await client.query(
      `
      SELECT * FROM episodes AS e
      WHERE e.show_id = $1 AND e.episodenumber > (SELECT MAX(w.episodenumber) AS episodenumber FROM tv_watched as w WHERE w.show_id = $1 AND w.user_id = $2)
      ORDER BY e.episodenumber ASC
      LIMIT 1;
    `,
      [showId, userId]
    );

    if (dbResult.rowCount === 0) {
      return null;
    }

    return mapEpisode(dbResult.rows[0]);
  },

  async getEpisode(showId: ShowId, episodenumber: number): Promise<Dragonstone.Episode | null> {
    return episodeLoader.load({ show_id: showId, episodenumber }).then(e => mapEpisode(e));
  },

  async getSeasonEpisodes(showId: ShowId, season: number): Promise<Dragonstone.Episode[]> {
    const start = calculateEpisodeNumber(season, 0);
    const end = calculateEpisodeNumber(season, 9999);
    const dbResult = await client.query(
      `
      SELECT * FROM episodes
      WHERE show_id = $1 AND episodenumber >= $2 AND episodenumber <= $3
    `,
      [showId, start, end]
    );
    return mapEpisodes(dbResult.rows);
  },

  async getSeasons(showId: ShowId): Promise<number[]> {
    const dbResult = await client.query(
      `
      SELECT DISTINCT episodenumber / 10000 as season
      FROM episodes WHERE show_id = $1;
    `,
      [showId]
    );
    return dbResult.rows.map(row => row.season);
  },

  async getNumberOfAiredEpisodes(showId: ShowId): Promise<number> {
    const dbResult = await client.query(
      `
        SELECT COUNT(*) AS c
        FROM episodes
        WHERE show_id = $1 AND first_aired <= $2;
      `,
      [showId, createDateString(new Date())]
    );
    return dbResult.rows[0].c;
  },

  async updateEpisodes(
    showId: ShowId,
    first: number,
    last: number,
    episodes: Message.Dragonstone.UpdateEpisodes.EpisodeInput[],
    logger: Logger
  ): Promise<boolean> {
    const currentShowDbResult = await client.query(`SELECT id FROM shows WHERE id = $1`, [showId]);
    if (currentShowDbResult.rowCount === 0) {
      logger.log(`Show with id "${showId}" do not exist. Do not update episodes.`);
      return false;
    }
    logger.log(`Start updating episodes for show with id: ${showId}. ${episodes.length} number of episodes`);
    const batch = createEpisodeBatch(client);

    const episodesDbResult = await client.query(
      `SELECT * FROM episodes WHERE episodenumber >= $1 AND episodenumber <= $2`,
      [first, last]
    );
    const knownEpisodes = new Set<number>();

    // See if we should update or remove any existed episodes
    for (let dbRow of episodesDbResult.rows) {
      const currentEpisode = dbRow as PgEpisode;
      const newEpisode = episodes.find(e => e.episodenumber === currentEpisode.episodenumber);
      knownEpisodes.add(currentEpisode.episodenumber);
      if (!newEpisode) {
        await batch.delete(showId, currentEpisode.episodenumber);
      } else if (currentEpisode.lastupdated < newEpisode.lastupdated) {
        const mappedEpisode = mapEpisodeInputToEpisode(showId, newEpisode);
        await batch.update(mappedEpisode);
      }
    }

    // Check if we should add any new episodes
    for (let episode of episodes) {
      if (knownEpisodes.has(episode.episodenumber)) {
        continue;
      }
      const mappedEpisode = mapEpisodeInputToEpisode(showId, episode);
      await batch.insert(mappedEpisode);
    }
    const stat = await batch.commit();
    logger.log(`Done with updating episodes for show with id: ${showId}. ${stat}`);
    return true;
  }
});
