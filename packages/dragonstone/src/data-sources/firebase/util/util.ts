import { Firestore, WriteBatch, DocumentReference } from '@google-cloud/firestore';

export function createBatch(firestore: Firestore) {
  let batch: WriteBatch | null = null;
  let batchSize = 0;
  return {
    async set(doc: DocumentReference, data: { [key: string]: any }) {
      if (!batch) {
        batch = firestore.batch();
        batchSize = 0;
      }
      batch.set(doc, data);
      batchSize++;
      if (batchSize === 500) {
        await batch.commit();
        batch = null;
      }
      return;
    },
    async update(doc: DocumentReference, data: { [key: string]: any }) {
      if (!batch) {
        batch = firestore.batch();
        batchSize = 0;
      }
      batch.update(doc, data);
      batchSize++;
      if (batchSize === 500) {
        await batch.commit();
        batch = null;
      }
      return;
    },
    async delete(doc: DocumentReference) {
      if (!batch) {
        batch = firestore.batch();
        batchSize = 0;
      }
      batch.delete(doc);
      batchSize++;
      if (batchSize === 500) {
        await batch.commit();
        batch = null;
      }
      return;
    },
    async commit() {
      if (!batch) {
        return;
      }
      return batch.commit();
    }
  };
}
