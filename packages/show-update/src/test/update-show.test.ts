import { spy } from 'simple-spy';
import { unixtimestamp, updateShow, updateEpisode, isSameEpisode, updateEpisodes } from '../update-show';

test('unixtimestamp', () => {
  const result = unixtimestamp();

  expect(result > 1000000000).toBe(true);
  expect(result < 1999999999).toBe(true);
});

test('Do not overwrite show name with null', () => {
  const show = {
    name: 'Game of thrones'
  };
  const tShow = {
    seriesName: null as null | string
  };
  const updatedShow = updateShow(show as any, tShow as any);

  expect(updatedShow.name).toBe('Game of thrones');
});

test('Do not overwrite episode name with null', () => {
  const episode = {
    name: 'Winter is comming'
  };
  const tEpisode = {
    episodeName: null as null | string
  };
  const updatedShow = updateEpisode(episode as any, tEpisode as any);

  expect(updatedShow.name).toBe('Winter is comming');
});

test('Two epeisodes are the same if the have the same episode and season number', () => {
  const episode = {
    episode: 2,
    season: 1
  };
  const tEpisode = {
    airedEpisodeNumber: 2,
    airedSeason: 1
  };
  const result = isSameEpisode(episode as any, tEpisode as any);
  expect(result).toBe(true);
});

test('updateEpisodes', async () => {
  const dbEpisodes = [
    {
      episode: 2,
      season: 1,
      lastupdated: 1
    },
    {
      episode: 3,
      season: 1
    }
  ];
  const theTvDbEpisodes = [
    {
      airedEpisodeNumber: 1,
      airedSeason: 1
    },
    {
      airedEpisodeNumber: 2,
      airedSeason: 1,
      lastUpdated: 2
    }
  ];
  const log = {
    eventStart: () => () => 1
  };
  const db = {
    getRepository: () => ({
      find: () => Promise.resolve(dbEpisodes)
    })
  };
  const updateEpisodesInDb = spy(() => 1);
  const addEpisodesInDb = spy(() => 1);
  const removeEpisodesInDb = spy(() => 1);

  await updateEpisodes(
    db as any,
    log as any,
    1,
    1,
    theTvDbEpisodes as any,
    updateEpisodesInDb as any,
    addEpisodesInDb as any,
    removeEpisodesInDb as any
  );
  expect(updateEpisodesInDb.callCount).toBe(1);
  const updated = updateEpisodesInDb.args[0][1];
  expect(updated.length).toBe(1);
  expect(updated[0].season).toBe(1);
  expect(updated[0].episode).toBe(2);

  expect(addEpisodesInDb.callCount).toBe(1);
  expect(addEpisodesInDb.args[0][1][0].season).toBe(1);
  expect(addEpisodesInDb.args[0][1][0].episode).toBe(1);
  expect(removeEpisodesInDb.callCount).toBe(1);
  expect(removeEpisodesInDb.args[0][1][0].season).toBe(1);
  expect(removeEpisodesInDb.args[0][1][0].episode).toBe(3);
});
