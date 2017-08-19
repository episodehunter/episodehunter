import { TheTvDbShowEpisode } from './types/the-tv-db-show-episode';
import { TheTvDbShow } from './types/the-tv-db-show';
import { TheTvDbShowImages } from './types/the-tv-db-show-images';

export async function getInformationFromTvDb(theTvDbId: number) {
  const theTvDbToken = await getTheTvDbToken();
  return await Promise.all([
    getTvDbShow(theTvDbToken, theTvDbId),
    getTvDbShowEpisodes(theTvDbToken, theTvDbId)
  ]);
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
  .then(res => res.json())
  .then(result => result.token);
}

export function getTvDbShow(token: string, theTvDbId: number): Promise<TheTvDbShow> {
  return fetch('https://api.thetvdb.com/series/' + theTvDbId, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(res => res.json());
}

export function getTvDbShowEpisodes(token: string, theTvDbId: number): Promise<TheTvDbShowEpisode[]> {
  // TODO: fix paging and fetch images as well
  return fetch('https://api.thetvdb.com/series/' + theTvDbId + '/episodes', {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(res => res.json());
}
