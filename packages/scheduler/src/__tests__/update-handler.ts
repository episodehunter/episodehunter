import { updateOldestShows } from '../handler';
import { publish, invoke } from '../../__mocks__/aws-sdk';

test('Should update shows', async () => {
  const context = {
    awsRequestId: 'some-request-id'
  };

  const result = await updateOldestShows(null as any, context as any);
  expect(result).toBe(4);
  expect(invoke.mock.calls.length).toBe(1);
  expect(invoke.mock.calls[0][0]).toEqual({
    Payload: JSON.stringify({
      limit: 10,
      requestStack: ['some-request-id']
    }),
    FunctionName: undefined, // We do not read config in test
    InvocationType: 'RequestResponse'
  });
  expect(publish.mock.calls.length).toBe(4);
  expect(publish.mock.calls[0][0].Message).toBe(
    JSON.stringify({
      id: 100,
      name: 'Show 100',
      tvdbId: 1,
      lastupdated: 1000000000,
      lastupdatedCheck: 1000000001
    })
  );
  expect(publish.mock.calls[1][0].Message).toBe(
    JSON.stringify({
      id: 101,
      name: 'Show 101',
      tvdbId: 2,
      lastupdated: 1000000002,
      lastupdatedCheck: 1000000003
    })
  );
  expect(publish.mock.calls[2][0].Message).toBe(
    JSON.stringify({
      id: 102,
      name: 'Show 102',
      tvdbId: 3,
      lastupdated: 1000000004,
      lastupdatedCheck: 1000000005
    })
  );
  expect(publish.mock.calls[3][0].Message).toBe(
    JSON.stringify({
      id: 103,
      name: 'Show 103',
      tvdbId: 3,
      lastupdated: 1000000006,
      lastupdatedCheck: 1000000007
    })
  );
});
