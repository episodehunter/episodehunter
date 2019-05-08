import { Dragonstone, Message } from '@episodehunter/types';
import { FirebaseShow } from '../types';

export function mapShow(show?: FirebaseShow): Dragonstone.Show | null {
  if (!show) {
    return null;
  }
  return {
    airs: show.airs,
    ended: show.ended,
    genre: show.genre,
    ids: show.ids,
    language: show.language,
    lastupdated: show.lastupdated,
    name: show.name,
    network: show.network,
    numberOfFollowers: show.numberOfFollowers,
    overview: show.overview,
    runtime: show.runtime
  };
}

export function mapShowInputToShow(showId: string, showInput: Message.Dragonstone.ShowInput): FirebaseShow {
  const show: FirebaseShow = {
    airs: {},
    ended: showInput.ended,
    genre: showInput.genre,
    ids: {
      id: showId,
      tvdb: showInput.tvdbId
    },
    lastupdated: showInput.lastupdate,
    name: showInput.name,
    runtime: showInput.runtime,
    numberOfFollowers: 0
  };
  if (showInput.airsDayOfWeek) {
    show.airs.day = showInput.airsDayOfWeek;
  }
  if (showInput.firstAired) {
    show.airs.first = showInput.firstAired;
  }
  if (showInput.airsTime) {
    show.airs.time = showInput.airsTime;
  }
  if (showInput.imdbId) {
    show.ids.imdb = showInput.imdbId;
  }
  if (showInput.language) {
    show.language = showInput.language;
  }
  if (showInput.network) {
    show.network = showInput.network;
  }
  if (showInput.overview) {
    show.overview = showInput.overview;
  }
  return show;
}
