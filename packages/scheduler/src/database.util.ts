import { Connection, entities } from '@episodehunter/datastore';

export async function getLastUpdated(connection: Connection) {
  const systemRepo = connection.getRepository(entities.SystemInfo);
  const dbRow = await systemRepo.findOne({ key: 'TV_UPDATE' });
  return Number(dbRow.value);
}

export async function updateLastUpdate(connection: Connection, lastUpdate: number) {
  const systemRepo = connection.getRepository(entities.SystemInfo);
  const dbRow = await systemRepo.findOne({ key: 'TV_UPDATE' });
  dbRow.value = String(lastUpdate);
  await systemRepo.save(dbRow);
}

export async function getExistingShows(connection: Connection, ids: number[]): Promise<number[]> {
  const idsString = ids
    .map(id => id | 0)
    .filter(id => id > 0)
    .join();
  const showRepo = connection.getRepository(entities.Show);
  const shows: { tvdb_id: number }[] = await showRepo.query(`SELECT tvdb_id FROM tv_show WHERE tvdb_id IN (${idsString})`);
  if (!shows) {
    return [];
  }
  return shows.map(show => show.tvdb_id);
}
