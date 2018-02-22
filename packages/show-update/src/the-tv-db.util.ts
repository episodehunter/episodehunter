import fetch, { Response } from 'node-fetch';
import { TheTvDbShow, TheTvDbShowEpisode, TheTvDbShowEpisodePage } from '@episodehunter/types/thetvdb';
import { TooManyEpisodes } from './custom-erros';

export async function getInformationFromTvDb(theTvDbId: number) {
  const theTvDbToken = await getTheTvDbToken();
  return await Promise.all([getTvDbShow(theTvDbToken, theTvDbId), getTvDbShowEpisodes(theTvDbToken, theTvDbId)]);
}

export function handelHttpError(res: Response) {
  if (!res.ok) {
    throw new Error('Unable to make the http request: ' + res.statusText);
  }
  return res;
}

export function getTheTvDbToken(_fetch = fetch): Promise<string> {
  return _fetch('https://api.thetvdb.com/login', {
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

export function getTvDbShow(token: string, theTvDbId: number, _fetch = fetch): Promise<TheTvDbShow> {
  return _fetch('https://api.thetvdb.com/series/' + theTvDbId, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  })
    .then(handelHttpError)
    .then(res => res.json())
    .then(res => res.data);
}

export async function getTvDbShowEpisodes(
  token: string,
  theTvDbId: number,
  page = 1,
  _fetch = fetch
): Promise<TheTvDbShowEpisode[]> {
  let episodes: TheTvDbShowEpisode[] = [];
  const response: TheTvDbShowEpisodePage = await _fetch(`https://api.thetvdb.com/series/${theTvDbId}/episodes?page=${page}`, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  }).then(res => {
    // The tv db API has a bug where the next page can give a 404
    if (res.status === 404) {
      return {
        data: [],
        links: {}
      } as TheTvDbShowEpisodePage;
    }
    handelHttpError(res);
    return res.json();
  });

  if (response.links && response.links.last && response.links.last > 30) {
    throw new TooManyEpisodes(`Number of episodes pages: ${response.links.last}`);
  }

  if (Array.isArray(response.data)) {
    episodes = response.data;
  }

  if (response.links && response.links.next) {
    episodes = episodes.concat(await getTvDbShowEpisodes(token, theTvDbId, response.links.next, _fetch));
  }

  return episodes;
}
