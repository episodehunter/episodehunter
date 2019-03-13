import { Firestore } from '@google-cloud/firestore';
import { createEpisodeResolver } from './episode/episode.resolver';
import { createUpcomingResolver } from './episode/upcoming.resolver';
import { createHistoryResolver } from './history/history.resolver';
import { createShowResolver } from './show/show.resolver';
import { createFirebaseDocs } from './util/firebase-docs';
import { createSelectors } from './util/selectors';
import { createUserResolver } from './user/user.resolver';

export const createResolver = (firestore: Firestore) => {
  const docs = createFirebaseDocs(firestore);
  const selectors = createSelectors(docs);

  return {
    show: createShowResolver(docs),
    upcoming: createUpcomingResolver(docs),
    episode: createEpisodeResolver(docs, selectors),
    history: createHistoryResolver(docs, selectors),
    user: createUserResolver(docs, selectors)
  };
};
