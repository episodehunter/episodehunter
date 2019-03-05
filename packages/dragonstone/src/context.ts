import { createResolver } from './data-sources/firebase';

export const createContext = () => {
  return {
    firebaseResolver: createResolver(),
    logger: {
      log: console.log,
      error: console.error
    }
  }
}

export type Context = ReturnType<typeof createContext>;
