import { Dragonstone } from '@episodehunter/types';
import { Client } from 'pg';
import { safeMap } from '../../../util/util';
import { PgFollowing } from '../pg-types';
import { insert } from '../util/pg-util';
import { mapUser } from './user.mapper';
import { Following } from '../../../resolvers/type';

export const createUserResolver = (client: Client) => ({
  async getFollowing(userId: number): Promise<Pick<Following, 'showId'>[]> {
    const dbResult = await client.query(`SELECT * FROM following WHERE user_id = $1`, [userId]);
    return safeMap(dbResult.rows, row => ({
      showId: row.show_id
    }));
  },
  async getUser(userId: number): Promise<Dragonstone.User | null> {
    const dbResult = await client.query(`SELECT * FROM user WHERE id = $1 LIMIT 1`, [userId]);
    return mapUser(dbResult.rows[0]);
  },
  async followShow(userId: number, showId: number): Promise<boolean> {
    const following: Omit<PgFollowing, 'id'> = {
      show_id: showId,
      user_id: userId
    };
    await client.query(insert('following', following));
    return true;
  },
  async unfollowShow(userId: number, showId: number): Promise<boolean> {
    await client.query(`DELETE FROM following WHERE show_id = $1 AND user_id = $2`, [showId, userId]);
    return true;
  },
  async getUid(firebaseUid: string): Promise<number | null> {
    if (!firebaseUid) {
      return null;
    }
    const dbResult = await client.query(`SELECT id FROM users WHERE firebase_id = $1 LIMIT 1`, [firebaseUid]);
    if (dbResult.rowCount === 0) {
      return null;
    }
    return dbResult.rows[0].id;
  }
});
