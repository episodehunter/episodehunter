import { PgClient } from '../../util/pg';
import { createEpisodeLoader } from './episode/episode.loader';
import { createEpisodeResolver } from './episode/episode.resolver';
import { createJustAirdLoader, createUpcomingLoader } from './episode/upcoming.loader';
import { createUpcomingResolver } from './episode/upcoming.resolver';
import { createHistoryResolver } from './history/history.resolver';
import { createHistoryLoader } from './history/hitsory.loader';
import { createNumberOfEpisodesToWatchLoader } from './history/number-of-episodes-to-watch.loader';
import { createShowLoader } from './show/show.loader';
import { createShowResolver } from './show/show.resolver';
import { createTitlesResolver } from './titles/titles.resolver';
import { createUserResolver } from './user/user.resolver';

export const createResolver = (client: PgClient) => {
  const episodeLoader = createEpisodeLoader(client);
  const showLoader = createShowLoader(client);
  const upcomingLoader = createUpcomingLoader(client);
  const justAirdLoader = createJustAirdLoader(client);
  const numberOfEpisodesToWatchLoader = createNumberOfEpisodesToWatchLoader(client);
  const historyLoader = createHistoryLoader(client);

  return {
    show: createShowResolver(client, showLoader),
    upcoming: createUpcomingResolver(upcomingLoader, justAirdLoader),
    episode: createEpisodeResolver(client, episodeLoader),
    history: createHistoryResolver(client, numberOfEpisodesToWatchLoader, historyLoader),
    user: createUserResolver(client),
    titles: createTitlesResolver(client)
  };
};

export type PgResolver = ReturnType<typeof createResolver>;
