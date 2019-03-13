import { Firestore } from '@google-cloud/firestore';
import { createResolver } from './data-sources/firebase';
import { AuthenticationError } from 'apollo-server-lambda';
import { Logger } from '@episodehunter/kingsguard';

export const createContext = (firestore: Firestore) => {
  return {
    firebaseResolver: createResolver(firestore),
    logger: {} as Logger,
    uid: null as null | string,
    getUid() {
      if (!this.uid) {
        throw new AuthenticationError('must authenticate');
      }
      return this.uid;
    }
  };
};

export type Context = ReturnType<typeof createContext>;
