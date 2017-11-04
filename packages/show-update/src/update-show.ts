import { Connection, entities } from '@episodehunter/datastore';
import { TheTvDbShow, TheTvDbShowEpisode } from '@episodehunter/types/thetvdb';
import { unixtimestamp } from './util';
import { logger } from './logger';

export async function updateShowInDb(db: Connection, tShow: TheTvDbShow) {
  const eventStop = logger.eventStart('Update show in db');
  const showRepo = db.getRepository(entities.Show);
  const show = await showRepo.findOne({ tvdb_id: tShow.id });
  if (!show) {
    throw new Error(`This is embarrassing but I can't find the show: ${tShow.id}`);
  }
  show.airs_dayOfWeek = tShow.airsDayOfWeek;
  show.airs_time = tShow.airsTime;
  show.first_aired = tShow.firstAired;
  show.genre = Array.isArray(tShow.genre) ? '|' + tShow.genre.join('|') + '|' : '';
  show.imdb_id = tShow.imdbId;
  show.name = tShow.seriesName;
  show.network = tShow.network;
  show.overview = tShow.overview;
  show.runtime = tShow.runtime;
  show.status = tShow.status;
  show.lastupdate = unixtimestamp();
  const updatedShow = await showRepo.save(show);
  eventStop();
  return updatedShow;
}

function updateEpisode(episode: entities.Episode, tEpisode: TheTvDbShowEpisode) {
  episode.tvdb_id = tEpisode.id;
  episode.episode = tEpisode.airedEpisodeNumber;
  episode.first_aired = tEpisode.firstAired;
  episode.name = tEpisode.episodeName;
  episode.overview = tEpisode.overview;
  episode.season = tEpisode.airedSeason;
  episode.lastupdated = tEpisode.lastUpdated;
}

function isSameEpisode(episode: entities.Episode, tEpisode: TheTvDbShowEpisode) {
  return episode.episode === tEpisode.airedEpisodeNumber && episode.season === tEpisode.airedSeason;
}

function removeEpisodes(db: Connection, episodes: entities.Episode[]) {
  const ids = episodes.map(episode => episode.id);

  return db
    .createQueryBuilder()
    .delete()
    .from(entities.Episode)
    .whereInIds(ids)
    .execute();
}

function addEpisodes(db: Connection, episodes: entities.Episode[]) {
  return db
    .createQueryBuilder()
    .insert()
    .into(entities.Episode)
    .values(episodes)
    .execute();
}

function updateEpisodesInDb(db: Connection, episodes: entities.Episode[]) {
  const episodeRepo = db.getRepository(entities.Episode);
  return Promise.all(episodes.map(episode => episodeRepo.updateById(episode.id, episode)));
}

export async function updateEpisodes(db: Connection, showId: number, theTvDbShowId: number, tEpisodes: TheTvDbShowEpisode[]) {
  const eventStop = logger.eventStart(`Update ${tEpisodes.length} episodes in db`);
  const episodeRepo = db.getRepository(entities.Episode);
  const findEpisodesStart = logger.eventStart(`Find episodes in db`);
  const episodes = await episodeRepo.find({ serie_id: showId });
  findEpisodesStart();
  const episodeToUpdate: entities.Episode[] = [];
  const episodeToDelete: entities.Episode[] = [];

  const sortEpisodeStart = logger.eventStart(`Sort episodes`);
  episodes.forEach(episode => {
    const tEpisode = tEpisodes.find(e => isSameEpisode(episode, e));
    if (!tEpisode) {
      episodeToDelete.push(episode);
      return;
    }
    if (tEpisode.lastUpdated > episode.lastupdated) {
      updateEpisode(episode, tEpisode);
      episodeToUpdate.push(episode);
    }
  });
  sortEpisodeStart();

  const createNewEpisodeStart = logger.eventStart(`Create new episodes`);
  const episodesToAdd = tEpisodes
    .filter(tEpisode => !Boolean(episodes.find(episode => isSameEpisode(episode, tEpisode))))
    .map(tEpisode => {
      const episode = new entities.Episode();
      updateEpisode(episode, tEpisode);
      episode.serie_tvdb_id = theTvDbShowId;
      episode.serie_id = showId;
      return episode;
    });
  createNewEpisodeStart();

  const updateEpisodesIntoDb = logger.eventStart(`Update ${episodeToUpdate.length} episodes in db`);
  await updateEpisodesInDb(db, episodesToAdd);
  updateEpisodesIntoDb();
  const addEpisodesIntoDb = logger.eventStart(`Add: ${episodesToAdd.length} episodes into db`);
  await addEpisodes(db, episodesToAdd);
  addEpisodesIntoDb();
  const removeEpisodesInDb = logger.eventStart(`Remove ${episodeToDelete.length} in the db.`);
  await removeEpisodes(db, episodeToDelete);
  removeEpisodesInDb();

  eventStop();
  return {
    addedEpisodes: episodesToAdd.length,
    updatedEpisodes: episodeToUpdate.length,
    removedEpisodes: episodeToDelete.length
  };
}
