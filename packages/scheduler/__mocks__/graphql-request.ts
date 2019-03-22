export const setHeader = jest.fn();
export class GraphQLClient {
  setHeader = setHeader;
  request() {
    return Promise.resolve({
      titles: [
        {
          id: 'game-of-thones',
          tvdbId: 1
        },
        {
          id: 'dexter',
          tvdbId: 2
        },
        {
          id: 'some-other-show',
          tvdbId: 4
        }
      ]
    });
  }
}
