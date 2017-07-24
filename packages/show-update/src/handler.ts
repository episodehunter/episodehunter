import { connect, Connection, entities } from '@episodehunter/datastore';
import * as got from 'got';

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

function updateIsNeeded(show: entities.Show | undefined): show is entities.Show {
  if (show && show.status === 'Continuing') {
    return true;
  }
  return false;
}

function getTheTvDbToken(): Promise<string> {
  return got.post('https://api.thetvdb.com/login', {
    json: true,
    body: JSON.stringify({
      apikey: process.env.THE_TV_DB_API_KEY,
      userkey: process.env.THE_TV_DB_USER_KEY
    })
  })
  .then(res => res.body.token);
}

function getTheTvDbShow(token: string, theTvDbId: string): Promise<TheTvDbShow> {
  return got.post('https://api.thetvdb.com/series/' + theTvDbId, {
    json: true,
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(res => res.body.data);
}

function getTheTvDbShowEpisodes(token: string, theTvDbId: string): Promise<TheTvDbShowEpisode[]> {
  return got.post('https://api.thetvdb.com/series/' + theTvDbId + '/episodes', {
    json: true,
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(res => res.body.data);
}

async function update(theTvDbId: string, db: Connection) {
  const showRepo = db.getRepository(entities.Show);
  const show = await showRepo.findOne({ tvdb_id: theTvDbId });
  if (!updateIsNeeded(show)) {
    return true;
  }
  const theTvDbToken = await getTheTvDbToken();
  const [ theTvDbShow, tvdbEpisodes ] = await Promise.all([
    getTheTvDbShow(theTvDbToken, theTvDbId), getTheTvDbShowEpisodes(theTvDbToken, theTvDbId)
  ]);


}

function hej(theTvDb) {
  const show = db.getShowByTvDb(theTvDb);
  const needToUpdate = isOngoning(show);
  if (!needToUpdate) {
    return true;
  }
  const token = getTheTvDbToken();
  const tvdbShow = getShowFromThetvdb();
  const tvdbEpisodes = getEpisodesFromThetvdb();
  const episodes = db.getEpisodes(show.id);
  const newEpisodes = updateEpisodes(episodes, tvdbEpisodes);
  const newShow = updateShow(show, tvdbShow);
  newShow.commit();
  newEpisodes.commit();
  const episodesWithMissingImages = extractEpisodesThatMissImages();
  episodesWithMissingImages.map(episode => {
    const tvdbEpisode = getEpisodeFromThetvdb(episode.thtvdb);
    if (tvdbEpisode.path) {
      SNS.add(tvdbEpisode.path);
    }
  });
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
