import { PgUser } from '../pg-types';
import { Dragonstone } from '@episodehunter/types';

export function mapUser(user?: PgUser): Dragonstone.User | null {
  if (!user) {
    return null;
  }
  return {
    apikey: user.api_key,
    username: user.name
  };
}
