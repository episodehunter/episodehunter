import { Dragonstone, Omit } from '@episodehunter/types';
import { Client } from 'pg';
import { safeMap } from '../../../util/util';
import { PgFollowing } from '../types';
import { insert } from '../util/pg-util';
import { mapUser } from './user.mapper';

export const createUserResolver = (client: Client) => ({
  async getFollowing(userId: number): Promise<number[]> {
    const dbResult = await client.query(`SELECT * FROM following WHERE user_id = $1`, [userId]);
    return safeMap(dbResult.rows, row => row.show_id);
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
  }
});
