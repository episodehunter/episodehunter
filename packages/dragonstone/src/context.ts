import { Firestore } from '@google-cloud/firestore';
import { createResolver } from './data-sources/firebase';

export const createContext = (firestore: Firestore) => {
  return {
    firebaseResolver: createResolver(firestore),
    logger: {
      log: console.log,
      error: console.error
    },
    uid: null as null | string
  };
};

export type Context = ReturnType<typeof createContext>;
