export class TheTvDb {
  fetchShow = jest.fn((theTvDbId: number) =>
    Promise.resolve({
      id: theTvDbId,
      seriesName: 'Dexter',
      status: 'Continuing',
      firstAired: '2016-08-16',
      network: 'Showtime',
      runtime: '60',
      genre: ['Drama', 'Thriller'],
      overview: 'Something, something',
      lastUpdated: 1000000005,
      airsDayOfWeek: 'Monday',
      airsTime: '21:00'
    })
  );
  fetchShowEpisodes = jest.fn((_: /*theTvDbId*/ number) =>
    Promise.resolve([
      {
        airedSeason: 0,
        airedEpisodeNumber: 1,
        episodeName: 'Special',
        firstAired: '2016-08-16',
        id: 1,
        lastUpdated: 1000000000,
        overview: 'Some data'
      },
      {
        airedSeason: 1,
        airedEpisodeNumber: 3,
        episodeName: 's01e03',
        firstAired: '2016-08-16',
        id: 4,
        lastUpdated: 1000000000,
        overview: 'Some data'
      },
      {
        airedSeason: 1,
        airedEpisodeNumber: 1,
        episodeName: 's01e01',
        firstAired: '2016-08-16',
        id: 2,
        lastUpdated: 1000000000,
        overview: 'Some data'
      },
      {
        airedSeason: 1,
        airedEpisodeNumber: 2,
        episodeName: 's01e02',
        firstAired: '2016-08-16',
        id: 3,
        lastUpdated: 1000000001,
        overview: 'Some data'
      }
    ])
  );
}
