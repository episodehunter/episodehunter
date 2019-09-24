export const setHeader = jest.fn();
export const request = jest.fn();
export class GraphQLClient {
  setHeader = setHeader;
  request = request;
}
