import { connect, Connection, entities } from '@episodehunter/datastore';
import { TheTvDbShow } from './types/the-tv-db-show';
import { TheTvDbShowEpisode } from './types/the-tv-db-show-episode';
import { getTheTvDbToken, getTvDbShow, getTvDbShowEpisodes, getInformationFromTvDb } from './the-tv-db.util';
import { ImageAction } from './types/image-action';

function unixtimestamp() {
  return Date.now() / 1000 | 0;
}

async function updateShowInDb(db: Connection, tShow: TheTvDbShow) {
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
  return showRepo.persist(show);
}

function updateEpisode(episode: entities.Episode, tEpisode: TheTvDbShowEpisode) {
  episode.episode = tEpisode.airedEpisodeNumber;
  episode.first_aired = tEpisode.firstAired;
  episode.name = tEpisode.episodeName;
  episode.overview = tEpisode.overview;
  episode.season = tEpisode.airedSeason;
  episode.lastupdate = unixtimestamp();
}

async function updateEpisodes(db: Connection, showId: number, theTvDbShowId: number, tEpisodes: TheTvDbShowEpisode[]) {
  const episodeRepo = db.getRepository(entities.Episode);
  const episodes = await episodeRepo.find({ tvdb_id: theTvDbShowId });
  const episodeToUpdate: entities.Episode[] = [];
  const episodeToDelete: entities.Episode[] = [];

  episodes.forEach(episode => {
    const tEpisode = tEpisodes.find(e => e.id === episode.tvdb_id);
    if (!tEpisode) {
      episodeToDelete.push(episode);
      return;
    }
    updateEpisode(episode, tEpisode);
    episodeToUpdate.push(episode);
  });

  const episodesToAdd = tEpisodes
    .filter(tEpisode => episodes.find(episode => episode.tvdb_id !== tEpisode.id))
    .map(tEpisode => {
      const episode = new entities.Episode();
      updateEpisode(episode, tEpisode);
      episode.serie_tvdb_id = theTvDbShowId;
      episode.tvdb_id = tEpisode.id;
      episode.serie_id = showId;
      return episode;
    });

  const episodesToPersist = episodesToAdd.concat(episodeToUpdate);

  episodeRepo.persist(episodesToAdd.concat(episodeToUpdate));
  episodeRepo.remove(episodeToDelete);
  return { episodesToPersist, episodeToDelete };
}

function updateImages(show: entities.Show, updateEpisodes: entities.Episode[], removedEpisodes: entities.Episode[]) {
  const actions: ImageAction[] = [];
  if (show.poster) {
    actions.push({
      action: 'add',
      id: show.id,
      type: 'showPoster'
    });
  }
  if (show.fanart) {
    actions.push({
      action: 'add',
      id: show.id,
      type: 'showFanart'
    });
  }
  updateEpisodes
    .filter(episode => !Boolean(episode.image))
    .forEach(episode => {
      actions.push({
        action: 'add',
        id: episode.id,
        type: 'episode'
      });
    });
  removedEpisodes
    .filter(episode => !Boolean(episode.image))
    .forEach(episode => {
      actions.push({
        action: 'remove',
        id: episode.id,
        type: 'episode'
      });
    });
}

async function updateShowAndEpisodes(theTvDbId: number, db: Connection) {
  const [ tShow, tEpisodes ] = await getInformationFromTvDb(theTvDbId);
  const show = await updateShowInDb(db, tShow);
  const { episodesToPersist, episodeToDelete } = await updateEpisodes(db, show.id, theTvDbId, tEpisodes);
  updateImages(show, episodesToPersist, episodeToDelete);
}

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
