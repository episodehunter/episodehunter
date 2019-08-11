import { Docs } from '../util/firebase-docs';
import { yesterDay } from '../../../util/date';
import { Title } from '../types';
import { PublicTypes } from '../../../public';

export const createTitlesResolver = (docs: Docs) => ({
  async lastUpdate(): Promise<Date> {
    return docs
      .titlesDoc()
      .get()
      .then(r => {
        const lastupdated = r.get('lastupdated');
        return lastupdated.toDate();
      });
  },
  async getTitles(): Promise<PublicTypes.Title[]> {
    return docs
      .titlesDoc()
      .get()
      .then(r => r.get('titles'));
  },
  async updateTitles(): Promise<boolean> {
    const lastUpdate = await this.lastUpdate();
    if (lastUpdate > yesterDay()) {
      return false;
    }
    const titles: Title[] = await docs
      .showCollection()
      .get()
      .then(r =>
        r.docs.map(d => ({
          id: d.id,
          name: d.get('name'),
          followers: d.get('numberOfFollowers') || 0,
          tvdbId: d.get('ids.tvdb') || 0
        }))
      );

    await docs.titlesDoc().update({ titles: titles, lastupdated: new Date() });

    return true;
  }
});
