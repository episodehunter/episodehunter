import { Client } from 'pg';
import { createEpisodeResolver } from './episode/episode.resolver';
import { createUpcomingResolver } from './episode/upcoming.resolver';
import { createHistoryResolver } from './history/history.resolver';
import { createShowResolver } from './show/show.resolver';
import { createUserResolver } from './user/user.resolver';
import { createTitlesResolver } from './titles/titles.resolver';

export const createResolver = (client: Client) => {
  return {
    show: createShowResolver(client),
    upcoming: createUpcomingResolver(client),
    episode: createEpisodeResolver(client),
    history: createHistoryResolver(client),
    user: createUserResolver(client),
    titles: createTitlesResolver(client)
  };
};

export type PgResolver = ReturnType<typeof createResolver>;
