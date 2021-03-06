import { updateShow, addShow } from '../update-show';
import { invoke } from '../../__mocks__/aws-sdk';
import { fetchShow, fetchShowEpisodes, NotFound } from '../../__mocks__/@episodehunter/thetvdb';
import { getTheTvDbId } from '../../__mocks__/@episodehunter/tmdb';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Update show', () => {
  test('Update show', async () => {
    // Arrange
    const event = {
      id: 100,
      tvdbId: 1,
      lastupdated: 1000000000
    };
    const logger: any = {
      log: () => null,
      warn: console.warn
    };
    const awsRequestId = 'aws-request-id';

    // Act
    await updateShow(event, logger, awsRequestId);

    // Assert
    expect(invoke).toBeCalledTimes(2);
    expect(invoke.mock.calls[0][0].FunctionName).toBe('UPDATE_SHOW_DRAGONSTONE_FUNCTION_NAME');
    expect(JSON.parse(invoke.mock.calls[0][0].Payload)).toEqual({
      showId: 100,
      showInput: {
        tvdbId: 1,
        name: 'Dexter',
        airsDayOfWeek: 0,
        airsTime: '21:00',
        firstAired: '2016-08-16',
        genre: ['Drama', 'Thriller'],
        network: 'Showtime',
        overview: 'Something, something',
        runtime: 60,
        ended: false,
        lastupdate: 1000000005
      },
      requestStack: ['aws-request-id']
    });
    expect(invoke.mock.calls[0][0].InvocationType).toBe('Event');
    expect(invoke.mock.calls[1][0].FunctionName).toBe('UPDATE_EPISODES_DRAGONSTONE_FUNCTION_NAME');
    expect(JSON.parse(invoke.mock.calls[1][0].Payload)).toEqual({
      showId: 100,
      firstEpisode: 10002,
      lastEpisode: 10003,
      episodes: [
        {
          tvdbId: 3,
          name: 's01e02',
          episodenumber: 10002,
          firstAired: '2016-08-16',
          overview: 'Some data',
          lastupdated: 1000000001
        },
        {
          tvdbId: 4,
          name: 's01e03',
          episodenumber: 10003,
          firstAired: '2016-08-16',
          overview: 'Some data',
          lastupdated: 1000000000 // Should update this because we are updating the prev episode
        }
      ],
      requestStack: ['aws-request-id']
    });
    expect(invoke.mock.calls[1][0].InvocationType).toBe('Event');
  });
});

describe('Add show', () => {
  test('add show', async () => {
    // Arrange
    const tvdbId = 1;
    const logger: any = {
      log: () => null
    };
    const awsRequestId = 'aws-request-id';

    // Act
    await addShow(tvdbId, logger, awsRequestId);

    // Assert
    expect(invoke).toBeCalledTimes(2);
    expect(invoke.mock.calls[0][0].FunctionName).toBe('ADD_SHOW_DRAGONSTONE_FUNCTION_NAME');
    expect(JSON.parse(invoke.mock.calls[0][0].Payload)).toEqual({
      showInput: {
        tvdbId: 1,
        name: 'Dexter',
        airsDayOfWeek: 0,
        airsTime: '21:00',
        firstAired: '2016-08-16',
        genre: ['Drama', 'Thriller'],
        network: 'Showtime',
        overview: 'Something, something',
        runtime: 60,
        ended: false,
        lastupdate: 1000000005
      },
      requestStack: ['aws-request-id']
    });
    expect(invoke.mock.calls[0][0].InvocationType).toBe(undefined);
    expect(invoke.mock.calls[1][0].FunctionName).toBe('UPDATE_EPISODES_DRAGONSTONE_FUNCTION_NAME');
    expect(JSON.parse(invoke.mock.calls[1][0].Payload)).toEqual({
      showId: 100,
      firstEpisode: 10001,
      lastEpisode: 10003,
      episodes: [
        {
          episodenumber: 10001,
          name: 's01e01',
          firstAired: '2016-08-16',
          tvdbId: 2,
          lastupdated: 1000000000,
          overview: 'Some data'
        },
        {
          episodenumber: 10002,
          name: 's01e02',
          firstAired: '2016-08-16',
          tvdbId: 3,
          lastupdated: 1000000001,
          overview: 'Some data'
        },
        {
          episodenumber: 10003,
          name: 's01e03',
          firstAired: '2016-08-16',
          tvdbId: 4,
          lastupdated: 1000000000,
          overview: 'Some data'
        }
      ],
      requestStack: ['aws-request-id']
    });
    expect(invoke.mock.calls[1][0].InvocationType).toBe('Event');
  });

  test('add show from a tmdbid', async () => {
    // Arrange
    const tvdbId = 10; // tmdbid
    const logger: any = {
      log: () => null
    };
    fetchShow.mockRejectedValueOnce(new NotFound());
    fetchShowEpisodes.mockRejectedValueOnce(new NotFound());
    getTheTvDbId.mockResolvedValueOnce(15);
    const awsRequestId = 'aws-request-id';

    // Act
    await addShow(tvdbId, logger, awsRequestId);

    // Assert
    expect(invoke).toBeCalledTimes(2);
    expect(invoke.mock.calls[0][0].FunctionName).toBe('ADD_SHOW_DRAGONSTONE_FUNCTION_NAME');
    expect(JSON.parse(invoke.mock.calls[0][0].Payload)).toEqual({
      showInput: {
        tvdbId: 15,
        name: 'Dexter',
        airsDayOfWeek: 0,
        airsTime: '21:00',
        firstAired: '2016-08-16',
        genre: ['Drama', 'Thriller'],
        network: 'Showtime',
        overview: 'Something, something',
        runtime: 60,
        ended: false,
        lastupdate: 1000000005
      },
      requestStack: ['aws-request-id']
    });
    expect(invoke.mock.calls[0][0].InvocationType).toBe(undefined);
    expect(invoke.mock.calls[1][0].FunctionName).toBe('UPDATE_EPISODES_DRAGONSTONE_FUNCTION_NAME');
    expect(JSON.parse(invoke.mock.calls[1][0].Payload)).toEqual({
      showId: 100,
      firstEpisode: 10001,
      lastEpisode: 10003,
      episodes: [
        {
          episodenumber: 10001,
          name: 's01e01',
          firstAired: '2016-08-16',
          tvdbId: 2,
          lastupdated: 1000000000,
          overview: 'Some data'
        },
        {
          episodenumber: 10002,
          name: 's01e02',
          firstAired: '2016-08-16',
          tvdbId: 3,
          lastupdated: 1000000001,
          overview: 'Some data'
        },
        {
          episodenumber: 10003,
          name: 's01e03',
          firstAired: '2016-08-16',
          tvdbId: 4,
          lastupdated: 1000000000,
          overview: 'Some data'
        }
      ],
      requestStack: ['aws-request-id']
    });
    expect(invoke.mock.calls[1][0].InvocationType).toBe('Event');
  });

  test('throw a not found error if we cant find the show in thetvdb or tmdb', async () => {
    // Arrange
    const tvdbId = 10;
    const logger: any = {
      log: () => null
    };
    fetchShow.mockRejectedValueOnce(new NotFound());
    fetchShowEpisodes.mockRejectedValueOnce(new NotFound());
    getTheTvDbId.mockResolvedValueOnce(null);
    const awsRequestId = 'aws-request-id';

    // Act and assert
    await expect(addShow(tvdbId, logger, awsRequestId)).rejects.toBeInstanceOf(NotFound);
    expect(invoke.mock.calls.length).toBe(0);
  });
});
