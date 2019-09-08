import { Dragonstone } from '@episodehunter/types';
import { safeMap } from '@episodehunter/utils';
import { Client } from 'pg';
import { spreadInsert, sql } from 'squid/pg';
import { Following } from '../../../resolvers/type';
import { FollowingRecord, NewFollowingRecord, UserRecord } from '../schema';
import { mapUser } from './user.mapper';

export const createUserResolver = (client: Client) => ({
  async getFollowing(userId: number): Promise<Pick<Following, 'showId'>[]> {
    const dbResult = await client.query<FollowingRecord>(sql`SELECT * FROM following WHERE user_id = ${userId}`);
    return safeMap((row: FollowingRecord) => ({
      showId: row.show_id
    }))(dbResult.rows);
  },
  async getUser(userId: number): Promise<Dragonstone.User | null> {
    const dbResult = await client.query<UserRecord>(sql`SELECT * FROM users WHERE id = ${userId} LIMIT 1`);
    return mapUser(dbResult.rows[0]);
  },
  async followShow(userId: number, showId: number): Promise<boolean> {
    const showResult = await client.query(sql`SELECT id from "shows" WHERE id=${showId} LIMIT 1`);
    if (showResult.rowCount === 0) {
      return false;
    }
    const following: NewFollowingRecord = {
      show_id: showId,
      user_id: userId
    };
    await client.query(sql`INSERT INTO "following" ${spreadInsert(following)};`);
    return true;
  },
  async unfollowShow(userId: number, showId: number): Promise<boolean> {
    await client.query(`DELETE FROM following WHERE show_id = ${showId} AND user_id = ${userId}`);
    return true;
  },
  async getUid(firebaseUid: string): Promise<number | null> {
    if (!firebaseUid) {
      return null;
    }
    const getUserId = () => client.query(sql`SELECT id FROM users WHERE firebase_id = ${firebaseUid} LIMIT 1`);
    let dbResult = await getUserId();
    if (dbResult.rowCount === 0) {
      await this.createUser(firebaseUid, { username: 'Batman' });
      dbResult = await getUserId();
      if (dbResult.rowCount === 0) {
        return null;
      }
    }
    return dbResult.rows[0].id;
  },
  async createUser(firebaseUid: string, metadata: Dragonstone.UserInput): Promise<boolean> {
    const apiKey = generateApiKey();
    await client.query(
      `INSERT INTO users (firebase_id, name, api_key) VALUES ($1, $2, $3) ON CONFLICT (firebase_id) DO UPDATE SET name = $2;`,
      [firebaseUid, metadata.username, apiKey]
    );
    return true;
  }
});

function generateApiKey() {
  const validChars = 'ABCDEFGHKMNPRSTUVWXY3456789';
  return Array.from<string>({ length: 5 }).reduce(key => {
    key += validChars[Math.floor(Math.random() * Math.floor(validChars.length))];
    return key;
  }, '');
}
