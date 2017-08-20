import { TheTvDbShowEpisode, TheTvDbShowEpisodeResponse } from './types/the-tv-db-show-episode';
import { TheTvDbShow } from './types/the-tv-db-show';
import { TheTvDbShowImages } from './types/the-tv-db-show-images';

export async function getInformationFromTvDb(theTvDbId: number) {
  const theTvDbToken = await getTheTvDbToken();
  return await Promise.all([
    getTvDbShow(theTvDbToken, theTvDbId),
    getTvDbShowEpisodes(theTvDbToken, theTvDbId)
  ]);
}

function handelHttpError(res: Response) {
  if (!res.ok) {
    throw new Error('Unable to make the http request: ' + res.statusText);
  }
  return res;
}

export function getTheTvDbToken(): Promise<string> {
  return fetch('https://api.thetvdb.com/login', {
    method: 'POST',
    body: JSON.stringify({
      apikey: process.env.THE_TV_DB_API_KEY,
      userkey: process.env.THE_TV_DB_USER_KEY
    }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(handelHttpError)
  .then(res => res.json())
  .then(result => result.token);
}

export function getTvDbShow(token: string, theTvDbId: number): Promise<TheTvDbShow> {
  return fetch('https://api.thetvdb.com/series/' + theTvDbId, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(handelHttpError)
  .then(res => res.json())
  .then(res => res.data);
}

export async function getTvDbShowEpisodes(token: string, theTvDbId: number, page = 1): Promise<TheTvDbShowEpisode[]> {
  let episodes: TheTvDbShowEpisode[] = [];
  const response: TheTvDbShowEpisodeResponse = await fetch(`https://api.thetvdb.com/series/${theTvDbId}/episodes?page=${page}`, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(handelHttpError)
  .then(res => res.json());

  if (Array.isArray(response.data)) {
    episodes = response.data;
  }

  if (response.links.next) {
    episodes.concat(await getTvDbShowEpisodes(token, theTvDbId, response.links.next));
  }

  return episodes;
}
