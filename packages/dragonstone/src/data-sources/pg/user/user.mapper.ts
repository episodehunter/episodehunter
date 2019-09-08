import { UserRecord } from '../schema';
import { Dragonstone } from '@episodehunter/types';

export function mapUser(user?: UserRecord): Dragonstone.User | null {
  if (!user) {
    return null;
  }
  return {
    apikey: user.api_key,
    username: user.name
  };
}
