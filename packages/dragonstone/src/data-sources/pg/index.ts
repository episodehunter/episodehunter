import { Client } from 'pg';
import { createEpisodeResolver } from './episode/episode.resolver';
import { createUpcomingResolver } from './episode/upcoming.resolver';
import { createUpcomingLoader } from './episode/upcoming.loader';
import { createEpisodeLoader } from './episode/episode.loader';
import { createHistoryResolver } from './history/history.resolver';
import { createNumberOfEpisodesToWatchLoader } from './history/number-of-episodes-to-watch.loader';
import { createShowResolver } from './show/show.resolver';
import { createShowLoader } from './show/show.loader';
import { createUserResolver } from './user/user.resolver';
import { createTitlesResolver } from './titles/titles.resolver';

export const createResolver = (client: Client) => {
  const episodeLoader = createEpisodeLoader(client);
  const showLoader = createShowLoader(client);
  const upcomingLoader = createUpcomingLoader(client);
  const numberOfEpisodesToWatchLoader = createNumberOfEpisodesToWatchLoader(client);
  return {
    show: createShowResolver(client, showLoader),
    upcoming: createUpcomingResolver(client, upcomingLoader),
    episode: createEpisodeResolver(client, episodeLoader),
    history: createHistoryResolver(client, numberOfEpisodesToWatchLoader),
    user: createUserResolver(client),
    titles: createTitlesResolver(client)
  };
};

export type PgResolver = ReturnType<typeof createResolver>;
