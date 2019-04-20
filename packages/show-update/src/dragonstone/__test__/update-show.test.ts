import { updateShow, addShow } from '../update-show';
import { invoke } from '../../../__mocks__/aws-sdk';

beforeEach(() => {
  invoke.mockClear();
});

describe('Update show', () => {
  test('Update show', async () => {
    // Arrange
    const event = {
      id: 'show-id',
      tvdbId: 1,
      lastupdated: 1000000000
    };
    const logger: any = {
      log: () => null
    };
    const awsRequestId = 'aws-request-id';

    // Act
    await updateShow(event, logger, awsRequestId);

    // Assert
    expect(invoke).toBeCalledTimes(2);
    expect(invoke.mock.calls[0][0]).toEqual({
      FunctionName: 'UPDATE_SHOW_DRAGONSTONE_FUNCTION_NAME',
      Payload: JSON.stringify({
        showId: 'show-id',
        showInput: {
          tvdbId: 1,
          name: 'Dexter',
          airsDayOfWeek: 0,
          airsTime: '21:00',
          firstAired: '2016-08-16',
          genre: ['Drama', 'Thriller'],
          network: 'Showtime',
          overview: 'SOmething, something',
          runtime: 60,
          ended: false,
          lastupdate: 1000000005
        },
        requestStack: ['aws-request-id']
      }),
      InvocationType: 'Event'
    });
    expect(invoke.mock.calls[1][0]).toEqual({
      FunctionName: 'UPDATE_EPISODES_DRAGONSTONE_FUNCTION_NAME',
      Payload: JSON.stringify({
        showId: 'show-id',
        firstEpisode: 10002,
        lastEpisode: 10003,
        episodes: [
          {
            tvdbId: 3,
            name: 's01e02',
            season: 1,
            episode: 2,
            firstAired: '2016-08-16',
            overview: 'Some data',
            lastupdated: 1000000001
          },
          {
            tvdbId: 4,
            name: 's01e03',
            season: 1,
            episode: 3,
            firstAired: '2016-08-16',
            overview: 'Some data',
            lastupdated: 1000000000 // Should update this because we are updating the prev episode
          }
        ],
        requestStack: ['aws-request-id']
      }),
      InvocationType: 'Event'
    });
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
    expect(invoke.mock.calls[0][0]).toEqual({
      FunctionName: 'ADD_SHOW_DRAGONSTONE_FUNCTION_NAME',
      Payload: JSON.stringify({
        showInput: {
          tvdbId: 1,
          name: 'Dexter',
          airsDayOfWeek: 0,
          airsTime: '21:00',
          firstAired: '2016-08-16',
          genre: ['Drama', 'Thriller'],
          network: 'Showtime',
          overview: 'SOmething, something',
          runtime: 60,
          ended: false,
          lastupdate: 1000000005
        },
        requestStack: ['aws-request-id']
      })
    });
    expect(invoke.mock.calls[1][0].FunctionName).toBe('UPDATE_EPISODES_DRAGONSTONE_FUNCTION_NAME');
    expect(invoke.mock.calls[1][0].InvocationType).toBe('Event');
    expect(JSON.parse(invoke.mock.calls[1][0].Payload)).toEqual({
      showId: 'some-new-id',
      firstEpisode: 10001,
      lastEpisode: 10003,
      episodes: [
        {
          season: 1,
          episode: 1,
          name: 's01e01',
          firstAired: '2016-08-16',
          tvdbId: 2,
          lastupdated: 1000000000,
          overview: 'Some data'
        },
        {
          season: 1,
          episode: 2,
          name: 's01e02',
          firstAired: '2016-08-16',
          tvdbId: 3,
          lastupdated: 1000000001,
          overview: 'Some data'
        },
        {
          season: 1,
          episode: 3,
          name: 's01e03',
          firstAired: '2016-08-16',
          tvdbId: 4,
          lastupdated: 1000000000,
          overview: 'Some data'
        }
      ],
      requestStack: ['aws-request-id']
    });
  });
});
