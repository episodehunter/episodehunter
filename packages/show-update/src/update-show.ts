import { TheTvDbShow, TheTvDbShowEpisode } from '@episodehunter/types/thetvdb';
import { Logger, entities, Connection } from '@episodehunter/kingsguard';

export function unixtimestamp() {
  return (Date.now() / 1000) | 0;
}

export function orDefualt<T>(value: T, defaultValue: T): T {
  if (value) {
    return value;
  }
  return defaultValue;
}

export async function updateShowInDb(db: Connection, log: Logger, tShow: TheTvDbShow) {
  const eventStop = log.eventStart('Update show in db');
  const showRepo = db.getRepository(entities.Show);
  const show = await showRepo.findOne({ tvdb_id: tShow.id });
  if (!show) {
    throw new Error(`This is embarrassing but I can't find the show: ${tShow.id}`);
  }
  const updatedShow = updateShow(show, tShow);
  await showRepo.update({ tvdb_id: tShow.id }, updatedShow);
  eventStop();
  return updatedShow;
}

export function updateShow(show: entities.Show, tShow: TheTvDbShow) {
  const newShow = Object.assign({}, show);
  newShow.airs_dayOfWeek = orDefualt(tShow.airsDayOfWeek, newShow.airs_dayOfWeek);
  newShow.airs_time = orDefualt(tShow.airsTime, newShow.airs_time);
  newShow.first_aired = orDefualt(tShow.firstAired, newShow.first_aired);
  newShow.genre = Array.isArray(tShow.genre) ? '|' + tShow.genre.join('|') + '|' : newShow.genre;
  newShow.imdb_id = orDefualt(tShow.imdbId, newShow.imdb_id);
  newShow.name = orDefualt(tShow.seriesName, newShow.name);
  newShow.network = orDefualt(tShow.network, newShow.network);
  newShow.overview = orDefualt(tShow.overview, newShow.overview);
  newShow.runtime = orDefualt(tShow.runtime, newShow.runtime);
  newShow.status = orDefualt(tShow.status, newShow.status);
  newShow.lastupdate = unixtimestamp();
  return newShow;
}

export function updateEpisode(episode: entities.Episode, tEpisode: TheTvDbShowEpisode) {
  const newEpisode = Object.assign({}, episode);
  newEpisode.tvdb_id = orDefualt(tEpisode.id, newEpisode.tvdb_id);
  newEpisode.episode = orDefualt(tEpisode.airedEpisodeNumber, newEpisode.episode);
  newEpisode.first_aired = orDefualt(tEpisode.firstAired, newEpisode.first_aired);
  newEpisode.name = orDefualt(tEpisode.episodeName, newEpisode.name);
  newEpisode.overview = orDefualt(tEpisode.overview, newEpisode.overview);
  newEpisode.season = orDefualt(tEpisode.airedSeason, newEpisode.season);
  newEpisode.lastupdated = orDefualt(tEpisode.lastUpdated, newEpisode.lastupdated);
  return newEpisode;
}

export function isSameEpisode(episode: entities.Episode, tEpisode: TheTvDbShowEpisode) {
  return (
    Number(episode.episode) === Number(tEpisode.airedEpisodeNumber) && Number(episode.season) === Number(tEpisode.airedSeason)
  );
}

function removeEpisodesInDb(db: Connection, episodes: entities.Episode[]) {
  const ids = episodes.map(episode => episode.id);

  return db
    .createQueryBuilder()
    .delete()
    .from(entities.Episode)
    .whereInIds(ids)
    .execute();
}

function addEpisodesInDb(db: Connection, episodes: entities.Episode[]) {
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

export async function updateEpisodes(
  db: Connection,
  log: Logger,
  showId: number,
  theTvDbShowId: number,
  tEpisodes: TheTvDbShowEpisode[],
  _updateEpisodesInDb = updateEpisodesInDb,
  _addEpisodesInDb = addEpisodesInDb,
  _removeEpisodesInDb = removeEpisodesInDb
) {
  const eventStop = log.eventStart(`Update ${tEpisodes.length} episodes in db`);
  const episodeRepo = db.getRepository(entities.Episode);
  const episodes = await episodeRepo.find({ serie_id: showId });
  const episodeToUpdate: entities.Episode[] = [];
  const episodeToDelete: entities.Episode[] = [];

  episodes.forEach(episode => {
    const tEpisode = tEpisodes.find(e => isSameEpisode(episode, e));
    if (!tEpisode) {
      episodeToDelete.push(episode);
      return;
    }
    if (tEpisode.lastUpdated > episode.lastupdated) {
      episodeToUpdate.push(updateEpisode(episode, tEpisode));
    }
  });

  const episodesToAdd = tEpisodes
    .filter(tEpisode => !Boolean(episodes.find(episode => isSameEpisode(episode, tEpisode))))
    .map(tEpisode => {
      const episode = updateEpisode(new entities.Episode(), tEpisode);
      episode.serie_tvdb_id = theTvDbShowId;
      episode.serie_id = showId;
      return episode;
    });

  await _updateEpisodesInDb(db, episodeToUpdate);
  await _addEpisodesInDb(db, episodesToAdd);
  await _removeEpisodesInDb(db, episodeToDelete);

  eventStop();
  return {
    addedEpisodes: episodesToAdd.length,
    updatedEpisodes: episodeToUpdate.length,
    removedEpisodes: episodeToDelete.length
  };
}
