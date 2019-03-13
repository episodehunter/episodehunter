import { Show as ShowType } from './types/show';
import { Episode as EpisodeType } from './types/episode';
import {
  WatchedEpisode as WatchedEpisodeType,
  UnwatchedEpisodeInput as UnwatchedEpisodeInputType,
  WatchedEpisodeInput as WatchedEpisodeInputType
} from './types/watched-episode';
import { WhatToWatch as WhatToWatchType } from './types/what-to-watch';
import { UpcomingEpisode as UpcomingEpisodeType } from './types/upcoming-episode';
import { Title as TitleType } from './types/title';

export declare namespace PublicTypes {
  interface Show extends ShowType {}
  interface Episode extends EpisodeType {}
  interface UpcomingEpisode extends UpcomingEpisodeType {}
  interface WatchedEpisode extends WatchedEpisodeType {}
  interface WhatToWatch extends WhatToWatchType {}
  interface UnwatchedEpisodeInput extends UnwatchedEpisodeInputType {}
  interface WatchedEpisodeInput extends WatchedEpisodeInputType {}
  interface Title extends TitleType {}
}
