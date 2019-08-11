import { PgTitle } from "../types";
import { Dragonstone } from "@episodehunter/types";

export function mapTitles(titles: PgTitle[]): Dragonstone.Title[] {
  return titles.map(pgTitle => ({
    id: pgTitle.id,
    name: pgTitle.name,
    followers: pgTitle.followers,
    tvdbId: pgTitle.external_ids_tvdb,
    lastupdated: pgTitle.lastupdated
  }))
}
