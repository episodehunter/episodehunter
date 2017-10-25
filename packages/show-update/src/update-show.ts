import { TheTvDbShow } from './types/the-tv-db-show';
import { Connection, entities } from '@episodehunter/datastore';
import { unixtimestamp } from './util';
import { TheTvDbShowEpisode } from './types/the-tv-db-show-episode';

export async function updateShowInDb(db: Connection, tShow: TheTvDbShow) {
  console.log('Update show in db');
  console.time('updateShowInDb');
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
  console.timeEnd('updateShowInDb');
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

export async function updateEpisodes(db: Connection, showId: number, theTvDbShowId: number, tEpisodes: TheTvDbShowEpisode[]) {
  console.log('Update episodes in db');
  console.time('updateEpisodes');
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
      updateEpisode(episode, tEpisode);
      episodeToUpdate.push(episode);
    }
  });

  const episodesToAdd = tEpisodes
    .filter(tEpisode => !Boolean(episodes.find(episode => isSameEpisode(episode, tEpisode))))
    .map(tEpisode => {
      const episode = new entities.Episode();
      updateEpisode(episode, tEpisode);
      episode.serie_tvdb_id = theTvDbShowId;
      episode.serie_id = showId;
      return episode;
    });

  const stat = {
    updatedEpisodes: await episodeRepo.save(episodesToAdd.concat(episodeToUpdate)),
    removedEpisodes: await episodeRepo.remove(episodeToDelete)
  };
  console.timeEnd('updateEpisodes');
  return stat;
}
