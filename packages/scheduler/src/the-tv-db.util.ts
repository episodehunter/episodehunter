import fetch from 'node-fetch';
import { TheTvDbUpdatedShowId } from '@episodehunter/types/thetvdb';

export async function getLastUpdateShows(lastUpdate: number): Promise<TheTvDbUpdatedShowId[]> {
  const token = await getTheTvDbToken();
  return fetch('https://api.thetvdb.com/updated/query?fromTime=' + lastUpdate, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  })
    .then(handelHttpError)
    .then(res => res.json())
    .then(res => res.data)
    .then(data => ensureArray(data));
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
    .then(handelHttpError)
    .then(res => res.json())
    .then(result => result.token);
}

function handelHttpError(res: Response) {
  if (!res.ok) {
    throw new Error('Unable to make the http request: ' + res.statusText);
  }
  return res;
}

function ensureArray(data: any) {
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}
