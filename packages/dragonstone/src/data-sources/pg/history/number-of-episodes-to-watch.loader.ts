import DataLoader from 'dataLoader';
import { Client } from 'pg';
import { dateFormat } from '../../../util/util';

interface Key {
  showId: number;
  userId: number;
}

export interface NumberOfEpisodesToWatch {
  numberOfEpisodesToWatch: number;
}

export function createNumberOfEpisodesToWatchLoader(client: Client): NumberOfEpisodesToWatchLoader {
  const getBatch = async (keys: Key[]): Promise<NumberOfEpisodesToWatch[]> => {
    const userId = keys[0].userId | 0;
    const uniqIds = Array.from(new Set(keys.map(key => Number(key.showId)).filter(Boolean)));
    const day = dateFormat();

    const dbRerult = await client.query(
      `
      SELECT COUNT(*) as c, show_id
      FROM episodes as e
      WHERE e.show_id in (${uniqIds.join(
        ','
      )}) AND e.first_aired <= $1 AND NOT EXISTS (SELECT 1 FROM tv_watched as w WHERE w.user_id = $2 AND w.show_id = e.show_id AND w.episodenumber = e.episodenumber) GROUP BY e.show_id;
    `,
      [day, userId]
    );

    return keys.map(key => {
      const match = dbRerult.rows.find(row => row.show_id === key.showId);
      if (match) {
        return { numberOfEpisodesToWatch: match.c };
      } else {
        return { numberOfEpisodesToWatch: 0 };
      }
    });
  };

  return new DataLoader<Key, NumberOfEpisodesToWatch>(getBatch, {
    cache: false
  });
}

export type NumberOfEpisodesToWatchLoader = DataLoader<Key, NumberOfEpisodesToWatch>;
