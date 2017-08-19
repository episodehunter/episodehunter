import { TheTvDbShowEpisode } from './types/the-tv-db-show-episode';
import { TheTvDbShow } from './types/the-tv-db-show';
import { TheTvDbShowImages } from './types/the-tv-db-show-images';

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

export function findBestShowImage(images: TheTvDbShowImages[]): string {
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

export function getTvDbShowImage(token: string, theTvDbId: number, type: 'fanart' | 'poster'): Promise<string> {
  return fetch(`https://api.thetvdb.com/series/${theTvDbId}/images/query?keyType=${type}`, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(res => res.json())
  .then((res: {data: TheTvDbShowImages[]}) => findBestShowImage(res.data));
}
