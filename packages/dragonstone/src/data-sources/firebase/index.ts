import { createShowResolver } from './show/show.resolver';
import { createFirebaseDocs } from './util/firebase-docs';
import { createFirebase } from './util/firebase-app';

export const createResolver = () => {
  const { firestore } = createFirebase()
  const docs = createFirebaseDocs(firestore);

  return {
    show: createShowResolver(docs)
  }
}
