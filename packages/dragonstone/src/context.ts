import { AuthenticationError } from 'apollo-server-lambda';
import { Logger } from '@episodehunter/kingsguard';
import { PgResolver } from './data-sources/pg';

export interface Context {
  pgResolver: PgResolver;
  logger: Logger;
  getUid(): number;
}

export const createContext = async (
  pgResolver: PgResolver,
  logger: Logger,
  firebaseUid: null | string
): Promise<Context> => {
  let uid = null as null | number;
  if (firebaseUid) {
    uid = await pgResolver.user.getUid(firebaseUid);
  }

  return {
    pgResolver,
    logger: logger,
    getUid(): number {
      if (!firebaseUid) {
        throw new AuthenticationError('must authenticate');
      } else if (!uid) {
        throw new AuthenticationError('Could not find user');
      }
      return uid;
    }
  };
};
