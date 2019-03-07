import { Firestore } from '@google-cloud/firestore';
import { createEpisodeResolver } from './episode/episode.resolver';
import { createUpcomingResolver } from './episode/upcoming.resolver';
import { createShowResolver } from './show/show.resolver';

import { createFirebaseDocs } from './util/firebase-docs';

export const createResolver = (firestore: Firestore) => {
  const docs = createFirebaseDocs(firestore);

  return {
    show: createShowResolver(docs),
    upcoming: createUpcomingResolver(docs),
    episode: createEpisodeResolver(docs)
  };
};
