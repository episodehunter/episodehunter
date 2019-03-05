import { PublicTypes } from "../../../public";
import { Show } from "./show.types";

export function mapShow(show?: Show): PublicTypes.Show | null {
  if (!show) {
    return null;
  }
  return {
    airs: show.airs,
    ended: show.ended,
    genre: show.genre,
    ids: show.ids,
    language: show.language,
    lastupdated: show.lastupdated,
    name: show.name,
    network: show.network,
    numberOfFollowers: show.numberOfFollowers,
    overview: show.overview,
    runtime: show.runtime,
    seasons: show.seasons,
    totalNumberOfEpisodes: show.totalNumberOfEpisodes
  }
}
