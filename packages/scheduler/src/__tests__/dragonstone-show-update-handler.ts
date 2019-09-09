import { update } from '../handler';
import { setHeader } from '../../__mocks__/graphql-request';
import { publish } from '../../__mocks__/aws-sdk';

test('Should update shows', async () => {
  const context = {
    awsRequestId: 'some-request-id'
  };

  const result = await update(null as any, context as any)
  expect(result).toBe(2);
  expect(setHeader.mock.calls.length).toBe(1);
  expect(setHeader.mock.calls[0][0]).toBe('x-request-stack');
  expect(setHeader.mock.calls[0][1]).toBe('some-request-id');
  expect(publish.mock.calls.length).toBe(2);
  expect(publish.mock.calls[0][0].Message).toBe('{"id":100,"lastupdated":1000000001,"tvdbId":1}');
  expect(publish.mock.calls[1][0].Message).toBe('{"id":105,"lastupdated":1000000003,"tvdbId":5}');
});
