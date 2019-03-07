import { Firestore } from '@google-cloud/firestore';

export const createFirebaseDocs = (db: Firestore) => ({
  showDoc(id: string) {
    return db.collection('shows').doc(id);
  },
  episodesCollection(showId: string) {
    return this.showDoc(showId).collection('episodes');
  }
});

export type Docs = ReturnType<typeof createFirebaseDocs>;
