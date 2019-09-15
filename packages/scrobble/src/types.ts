export type PlexPlaybackEvent =
  | 'media.play'
  | 'media.pause'
  | 'media.resume'
  | 'media.stop'
  | 'media.scrobble'
  | 'media.rate'
export type PlexMediaType = 'movie' | 'track' | 'episode'
export type MediaProvider = 'thetvdb' | 'imdb'

export interface PlexEvent {
  event: PlexPlaybackEvent;
  Metadata: {
    guid: string;
    type: PlexMediaType;
  };
}

export interface KodiEvent {
  username: string;
  apikey: string;
  duration: number;
  percent: number;
  timestamp: number;
  event_type: 'stop' | 'scrobble' | 'play';
  media_type: 'episode' | 'movie';
}

export interface KodiEpisodeEvent extends KodiEvent {
  tvdb_id: string | number;
  title: string;
  year: number | string;
  season: number | string;
  episode: number | string;
}

export interface KodiMovieEvent extends KodiEvent {
  original_title: string;
  year: number | string;
  themoviedb_id: number | string;
}
