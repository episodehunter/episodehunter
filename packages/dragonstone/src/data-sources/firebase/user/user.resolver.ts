import firestore from '@google-cloud/firestore';
import { FirebaseUsermetaData } from '../types';
import { Docs } from '../util/firebase-docs';
import { Selectors } from '../util/selectors';

export const createUserResolver = (docs: Docs, selectors: Selectors) => ({
  async getFollowing(userId: string): Promise<string[]> {
    return selectors.getFollowingList(userId);
  },
  async getUser(userId: string): Promise<FirebaseUsermetaData> {
    return selectors.getUsermetadata(userId)
  },
  async followShow(userId: string, showId: string): Promise<boolean> {
    return docs
      .userDoc(userId)
      .update({
        following: firestore.FieldValue.arrayUnion(showId)
      })
      .then(() => true);
  },
  async unfollowShow(userId: string, showId: string): Promise<boolean> {
    return docs
      .userDoc(userId)
      .update({
        following: firestore.FieldValue.arrayRemove(showId)
      })
      .then(() => true);
  }
});
