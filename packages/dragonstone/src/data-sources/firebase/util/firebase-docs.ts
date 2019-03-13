import { Firestore, CollectionReference } from '@google-cloud/firestore';

export const createFirebaseDocs = (db: Firestore) => ({
  showDoc(id: string) {
    return this.showCollection().doc(id);
  },
  showCollection() {
    return db.collection('shows');
  },
  episodesCollection(showId: string) {
    return this.showDoc(showId).collection('episodes');
  },
  showsWatchHistoryCollection(userId: string): CollectionReference {
    return this.userDoc(userId).collection('showsWatchHistory');
  },
  userDoc(id: string) {
    return db.collection('users').doc(id);
  },
  titlesDoc() {
    return db.collection('metadata').doc('titles');
  }
});

export type Docs = ReturnType<typeof createFirebaseDocs>;
