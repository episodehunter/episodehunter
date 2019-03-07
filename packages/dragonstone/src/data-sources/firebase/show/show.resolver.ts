import { PublicTypes } from '../../../public';
import { Docs } from '../util/firebase-docs';
import { mapShow } from './show.mapper';
import { Show } from './show.types';

export const createShowResolver = (docs: Docs) => ({
  async getShow(id: string): Promise<PublicTypes.Show | null> {
    const showDoc = await docs.showDoc(id).get();
    if (showDoc.exists) {
      return mapShow(showDoc.data() as Show);
    }
    return null;
  }
});
