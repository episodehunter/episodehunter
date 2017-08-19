import { connect, Connection, entities } from '@episodehunter/datastore';
import fetch from 'node-fetch';

interface ImageAction {
  id: number;
  type: 'showPoster' | 'showFanart' | 'episode';
  action: 'update' | 'add' | 'remove';
}

interface TheTvDbShow {
  id: number;
  seriesName: string;
  seriesId: string;
  status: 'Continuing';
  firstAired: string; // YYYY-MM-DD
  network: string;
  runtime: string; // eg. 55
  genre: string[];
  overview: string;
  lastUpdated: number; // unix timestamp
  airsDayOfWeek: string; // eg. Sunday
  airsTime: string; // 9:00 PM
  imdbId: string;
  zap2itId: string;
}

interface TheTvDbShowEpisode {
  airedEpisodeNumber: number;
  airedSeason: number;
  episodeName: string;
  firstAired: string; // 2010-12-05
  id: number;
  lastUpdated: 1305321193;
  overview: string;
}

interface TheTvDbShowImages {
  id: number;
  keyType: 'fanart' | 'poster';
  subKey: string;
  fileName: string; // fanart/original/121361-3.jpg
  resolution: string; // 1280x720
  ratingsInfo: {
    average: number;
    count: number;
  };
  thumbnail: string;
}

function updateIsNeeded(show: entities.Show | undefined): show is entities.Show {
  if (show && show.status === 'Continuing') {
    return true;
  }
  return false;
}

function getTheTvDbToken(): Promise<string> {
  return fetch('https://api.thetvdb.com/login', {
    method: 'POST',
    body: JSON.stringify({
      apikey: process.env.THE_TV_DB_API_KEY,
      userkey: process.env.THE_TV_DB_USER_KEY
    }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(res => res.json())
  .then(result => result.token);
}

function getTvDbShow(token: string, theTvDbId: number): Promise<TheTvDbShow> {
  return fetch('https://api.thetvdb.com/series/' + theTvDbId, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(res => res.json());
}

function getTvDbShowEpisodes(token: string, theTvDbId: number): Promise<TheTvDbShowEpisode[]> {
  // TODO: fix paging and fetch images as well
  return fetch('https://api.thetvdb.com/series/' + theTvDbId + '/episodes', {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(res => res.json());
}

function findBestShowImage(images: TheTvDbShowImages[]): string {
  const bestImage = images.reduce((p, c) => {
    const average = c.ratingsInfo.average * Math.log(c.ratingsInfo.count);
    if (p.average < average) {
      return { average, url: c.fileName };
    }
    return p;
  }, {average: -1, url: null});
  if (bestImage.average > 7) {
    return bestImage.url;
  }
  const highestAverage = images.reduce((p, c) => {
    if (p.average < c.ratingsInfo.average) {
      return { average: c.ratingsInfo.average, url: c.fileName };
    }
    return p;
  }, {average: -1, url: null});
  return highestAverage.url;
}

function getTvDbShowImage(token: string, theTvDbId: number, type: 'fanart' | 'poster'): Promise<string> {
  return fetch(`https://api.thetvdb.com/series/${theTvDbId}/images/query?keyType=${type}`, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(res => res.json())
  .then((res: {data: TheTvDbShowImages[]}) => findBestShowImage(res.data));
}

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

async function getInformationFromTvDb(theTvDbId: number) {
  const theTvDbToken = await getTheTvDbToken();
  return await Promise.all([
    getTvDbShow(theTvDbToken, theTvDbId),
    getTvDbShowImage(theTvDbToken, theTvDbId, 'fanart'),
    getTvDbShowImage(theTvDbToken, theTvDbId, 'poster'),
    getTvDbShowEpisodes(theTvDbToken, theTvDbId)
  ]);
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

async function update(theTvDbId: number, db: Connection) {
  const [ tShow, tFanart, tPoster, tEpisodes ] = await getInformationFromTvDb(theTvDbId);
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
