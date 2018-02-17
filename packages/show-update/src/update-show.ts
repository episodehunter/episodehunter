import { TheTvDbShow, TheTvDbShowEpisode } from '@episodehunter/types/thetvdb';
import { GraphQLClient } from 'graphql-request';
import { gql } from './gql';
import { getInformationFromTvDb } from './the-tv-db.util';
import { ShowDefinitionType } from './types/show-definition.type';
import { EpisodeDefinitionType } from './types/episode-definition.type';

type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

function safeMap<T, R>(fu: (a: T) => R): (arr: T[]) => R[] {
  return (arr: T[]) => (Array.isArray(arr) ? arr.map(fu) : []);
}

const client = new GraphQLClient('http://localhost:4000/graphql');

function updateShowRequest(showDef: Partial<ShowDefinitionType>) {
  const query = gql`
    mutation UpdateShowAndGetMissingImg($showInput: ShowInput!) {
      showUpdate(show: $showInput) {
        id
        poster
        fanart
        episodes {
          id
          tvdbId
          image
          lastupdated
        }
      }
    }
  `;
  return client.request<Partial<ShowDefinitionType>>(query, { showInput: showDef });
}

function mapTheTvShowEpisodeToDefinition(tEpisodes: TheTvDbShowEpisode): DeepPartial<EpisodeDefinitionType> {
  return {
    tvdbId: tEpisodes.id,
    name: tEpisodes.episodeName,
    season: tEpisodes.airedSeason,
    episode: tEpisodes.airedEpisodeNumber,
    firstAired: tEpisodes.firstAired,
    overview: tEpisodes.overview,
    lastupdated: tEpisodes.lastUpdated
  };
}

function mapTheTvShowToDefinition(tShow: TheTvDbShow): Partial<ShowDefinitionType> {
  return {
    tvdbId: tShow.id,
    imdbId: tShow.imdbId,
    name: tShow.seriesName,
    airsDayOfWeek: tShow.airsDayOfWeek,
    airsTime: tShow.airsTime,
    firstAired: tShow.firstAired,
    genre: tShow.genre,
    network: tShow.network,
    overview: tShow.overview,
    runtime: (tShow.runtime as any | 0) || undefined,
    ended: tShow.status === 'Ended',
    lastupdate: tShow.lastUpdated
  };
}

function requestShowImagesIfMissing(show: Partial<ShowDefinitionType>) {
  if (!show.poster) {
    console.log('Request show poster');
  }
  if (!show.fanart) {
    console.log('Request show fanart');
  }
}

function isSameEpisodesAsDefinition(tEpisode: TheTvDbShowEpisode) {
  return (dEpisode: EpisodeDefinitionType) => {
    return tEpisode.airedSeason === dEpisode.season && tEpisode.airedEpisodeNumber === dEpisode.episode;
  };
}

function isSameEpisodesAsTheTvDb(dEpisode: Partial<EpisodeDefinitionType>) {
  return (tEpisode: TheTvDbShowEpisode) => {
    return tEpisode.airedSeason === dEpisode.season && tEpisode.airedEpisodeNumber === dEpisode.episode;
  };
}

function isValidEpisode(episode: TheTvDbShowEpisode) {
  return Boolean(episode.airedEpisodeNumber && episode.airedSeason && episode.episodeName);
}

function splitEpisodeList(
  tEpisodes: TheTvDbShowEpisode[],
  dEpisodes: Partial<EpisodeDefinitionType>[]
): {
  episodesToAdd: Partial<EpisodeDefinitionType>[];
  episodesToUpdate: Partial<EpisodeDefinitionType>[];
  episodesToRemove: Partial<EpisodeDefinitionType>[];
} {
  const episodesToAdd = [];
  const episodesToUpdate = [];
  const episodesToRemove: Partial<EpisodeDefinitionType>[] = [];

  for (const tEpisode of tEpisodes) {
    if (!isValidEpisode(tEpisode)) {
      continue;
    }
    const dEpisode = dEpisodes.find(isSameEpisodesAsDefinition(tEpisode));
    if (!dEpisode) {
      episodesToAdd.push(tEpisode);
      continue;
    }
    if (tEpisode.lastUpdated > dEpisode.lastupdated) {
      episodesToUpdate.push(tEpisode);
    }
  }

  for (const dEpisode of dEpisodes) {
    const tEpisode = tEpisodes.find(isSameEpisodesAsTheTvDb(dEpisode));
    if (!tEpisode) {
      episodesToRemove.push(dEpisode);
    }
  }

  return {
    episodesToAdd: episodesToAdd.map(mapTheTvShowEpisodeToDefinition),
    episodesToUpdate: episodesToUpdate.map(mapTheTvShowEpisodeToDefinition),
    episodesToRemove
  };
}

export async function updateShow(tvDbId: number) {
  const [tShow, tEpisodes] = await getInformationFromTvDb(tvDbId);
  const showDef = mapTheTvShowToDefinition(tShow);
  const updatedShow = await updateShowRequest(showDef);
  const requestingShowImages = requestShowImagesIfMissing(updatedShow);
  const { episodesToAdd, episodesToUpdate, episodesToRemove } = splitEpisodeList(tEpisodes, showDef.episodes);

  // mapTheTvShowToDefinition
  // Update show and get id and episodes
  // Split episodes into five arrays: new episodes, episodes to update, deleted episodes, images to add, images to remove
  // Send three requests
  // When getting back, sending request for adding and removing images
  // .then();
}
