import { Show, Episode } from '@episodehunter/types/dragonstone';
import { ShowId } from '@episodehunter/types';

// TODO: move this
export interface NextToWatch {
  numberOfEpisodesToWatch: number;
}

export interface Following {
  showId: ShowId;
  show: Show;
  upcommingEpisode: Episode;
  nextToWatch: NextToWatch;
}
