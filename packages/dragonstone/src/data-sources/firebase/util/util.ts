import { Firestore, WriteBatch, DocumentReference } from '@google-cloud/firestore';

export function createBatch(firestore: Firestore) {
  let batch: WriteBatch | null = null;
  let batchSize = 0;
  const stat = {
    deleted: 0,
    updated: 0,
    added: 0
  }
  return {
    async set(doc: DocumentReference, data: { [key: string]: any }) {
      if (!batch) {
        batch = firestore.batch();
        batchSize = 0;
      }
      batch.set(doc, data);
      stat.added++;
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
      stat.updated++;
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
      stat.deleted++;
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
    },
    getStat() {
      return stat;
    }
  };
}
