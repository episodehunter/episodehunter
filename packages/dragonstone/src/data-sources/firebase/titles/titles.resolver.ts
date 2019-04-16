import { Dragonstone } from '@episodehunter/types';
import { yesterDay } from '../../../util/date';
import { Title } from '../types';
import { Docs } from '../util/firebase-docs';

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
  async getTitles(): Promise<Dragonstone.Title[]> {
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
    const now = (Date.now() / 1000) | 0;
    const titles: Title[] = await docs
      .showCollection()
      .get()
      .then(r =>
        r.docs.map(d => ({
          id: d.id,
          name: d.get('name'),
          followers: d.get('numberOfFollowers') || 0,
          tvdbId: d.get('ids.tvdb'),
          lastupdated: Math.min(now, d.get('lastupdated'))
        }))
      );

    await docs.titlesDoc().update({ titles: titles, lastupdated: new Date() });

    return true;
  }
});
