import { Firestore } from '@google-cloud/firestore';

export const createFirebaseDocs = (db: Firestore) => ({
  showDoc(id: string) {
    return db.collection('shows').doc(id);
  },
  episodesCollection(showId: string) {
    return this.showDoc(showId).collection('episodes');
  },
  showsWatchHistoryCollection(userId: string) {
    return this.userDoc(userId).collection('showsWatchHistory');
  },
  userDoc(id: string) {
    return db.collection('users').doc(id);
  }
});

export type Docs = ReturnType<typeof createFirebaseDocs>;
