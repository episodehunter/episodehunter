import { PublicTypes } from '../../../public';
import { Docs } from '../util/firebase-docs';
import { mapShow } from './show.mapper';
import { Show } from './show.types';

const showCache = new Map<string, Promise<PublicTypes.Show | null>>();

async function getShow(docs: Docs, id: string): Promise<PublicTypes.Show | null> {
  const showDoc = await docs.showDoc(id).get();
  if (showDoc.exists) {
    return mapShow(showDoc.data() as Show);
  }
  return null;
}

export const createShowResolver = (docs: Docs) => ({
  async getShow(id: string): Promise<PublicTypes.Show | null> {
    if (!showCache.has(id)) {
      showCache.set(id, getShow(docs, id));
    }
    return showCache.get(id) || null;
  }
});
