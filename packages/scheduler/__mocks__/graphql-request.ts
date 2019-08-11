export const setHeader = jest.fn();
export class GraphQLClient {
  setHeader = setHeader;
  request() {
    return Promise.resolve({
      titles: [
        {
          id: 100,
          tvdbId: 1,
          lastupdated: 1000000000
        },
        {
          id: 102,
          tvdbId: 2,
          lastupdated: 1000000001
        },
        {
          id: 104,
          tvdbId: 4,
          lastupdated: 1000000002
        },
        {
          id: 105,
          tvdbId: 5,
          lastupdated: 1000000002
        }
      ]
    });
  }
}
