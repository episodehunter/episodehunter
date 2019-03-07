import { createShowResolver } from './show/show.resolver';
import { createFirebaseDocs } from './util/firebase-docs';
import { createFirebase } from './util/firebase-app';
import { createUpcomingResolver } from './episode/upcoming.resolver';

export const createResolver = () => {
  const { firestore } = createFirebase();
  const docs = createFirebaseDocs(firestore);

  return {
    show: createShowResolver(docs),
    upcoming: createUpcomingResolver(docs)
  };
};
