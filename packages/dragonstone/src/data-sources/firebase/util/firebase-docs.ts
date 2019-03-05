import { Firestore } from "@google-cloud/firestore";

export const createFirebaseDocs = (db: Firestore) => ({
  showDoc(id: string) {
    return db.collection('shows').doc(id);
  }
})

export type Docs = ReturnType<typeof createFirebaseDocs>;
