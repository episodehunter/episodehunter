import { Docs } from '../util/firebase-docs';
import { Selectors } from '../util/selectors';
import firestore = require('@google-cloud/firestore');

export const createUserResolver = (docs: Docs, selectors: Selectors) => ({
  async getFollowing(userId: string): Promise<string[]> {
    return selectors.getFollowingList(userId);
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
