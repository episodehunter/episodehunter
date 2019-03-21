import { Firestore } from '@google-cloud/firestore';
import { createResolver } from './data-sources/firebase';
import { AuthenticationError } from 'apollo-server-lambda';
import { Logger } from '@episodehunter/kingsguard';

export const createContext = (firestore: Firestore) => {
  return {
    firebaseResolver: createResolver(firestore),
    logger: {} as Logger,
    uid: null as null | string,
    usingApiKey: false,
    getUid() {
      if (!this.uid) {
        throw new AuthenticationError('must authenticate');
      }
      return this.uid;
    },
    assertApiKey() {
      if (!this.usingApiKey) {
        throw new AuthenticationError('missing api key');
      }
    }
  };
};

export type Context = ReturnType<typeof createContext>;
