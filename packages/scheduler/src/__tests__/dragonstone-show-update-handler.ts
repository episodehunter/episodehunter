import { update } from '../dragonstone-show-updater-handler';
import { setHeader } from '../../__mocks__/graphql-request';
import { publish } from '../../__mocks__/aws-sdk';

test('Should update shows', done => {
  const event: null = null;
  const context = {
    awsRequestId: 'some-request-id'
  };

  update(event, context as any, (error, result) => {
    if (error) {
      return done(error);
    }
    expect(result).toBe(2);
    expect(setHeader.mock.calls.length).toBe(1);
    expect(setHeader.mock.calls[0][0]).toBe('x-request-stack');
    expect(setHeader.mock.calls[0][1]).toBe('some-request-id');
    expect(publish.mock.calls.length).toBe(2);
    expect(publish.mock.calls[0][0].Message).toBe('{"id":"game-of-thones","tvdbId":1}');
    expect(publish.mock.calls[1][0].Message).toBe('{"id":"some-other-show","tvdbId":4}');
    done();
  });
});
