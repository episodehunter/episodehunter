import { PublicTypes } from '../../../public';
import { Docs } from '../util/firebase-docs';
import { mapShow, mapShowInputToShow } from './show.mapper';
import { Show } from './show.types';
import { Logger } from '@episodehunter/logger';

const showCache = new Map<string, Promise<PublicTypes.Show | null>>();

async function getShow(docs: Docs, id: string): Promise<PublicTypes.Show | null> {
  const showDoc = await docs.showDoc(id).get();
  if (showDoc.exists) {
    return mapShow(showDoc.data() as Show);
  }
  return null;
}

export const createShowResolver = (docs: Docs) => {
  const generateSlugShowName = async (showName: string) => {
    const orgShowNameSlug = nameSlug(showName);
    let showNameSlug = orgShowNameSlug;
    if (showNameSlug.length < 1) {
      showNameSlug = 'nameless';
    }
    for (let n = 1; n <= 10; n++) {
      const showDoc = await docs.showDoc(showNameSlug).get();
      if (!showDoc.exists) {
        break;
      } else if (n === 10) {
        showNameSlug = String((Math.random() * 10000000) | 0);
      } else {
        showNameSlug = orgShowNameSlug + n;
      }
    }
    return showNameSlug;
  };
  return {
    async getShow(id: string): Promise<PublicTypes.Show | null> {
      if (!showCache.has(id)) {
        showCache.set(id, getShow(docs, id));
      }
      return showCache.get(id) || null;
    },
    async updateShow(
      showId: string,
      showInput: PublicTypes.ShowInput,
      logger: Logger
    ): Promise<PublicTypes.Show | null> {
      const currentShowDoc = await docs.showDoc(showId).get();
      if (!currentShowDoc.exists) {
        logger.log(`Show with id "${showId}" do not exist. Do not update.`);
        return null;
      }
      const newShow = mapShowInputToShow(showId, showInput);
      delete newShow.numberOfFollowers;
      await currentShowDoc.ref.update(newShow)
      return newShow;
    },
    async addShow(showInput: PublicTypes.ShowInput, logger: Logger): Promise<PublicTypes.Show> {
      const currentShowDoc = await docs
        .showCollection()
        .where('ids.tvdb', '==', showInput.tvdbId)
        .limit(1)
        .get();
      if (currentShowDoc.size > 0) {
        logger.log(`Show with thetvdb ${showInput.tvdbId} do already exist`);
        return currentShowDoc.docs[0].data() as Show;
      }
      const showId = await generateSlugShowName(showInput.name);
      const newShow = mapShowInputToShow(showId, showInput);
      await docs.showDoc(showId).set(newShow);
      return newShow;
    }
  };
};

const nameSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
