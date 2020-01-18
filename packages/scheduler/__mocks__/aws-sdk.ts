export const publish = jest.fn<any, any>(() => ({
  promise: () => Promise.resolve()
}));

export const invoke = jest.fn<any, any>(() => ({
  promise: () =>
    Promise.resolve({
      Payload: JSON.stringify({
        shows: [
          {
            id: 100,
            name: 'Show 100',
            tvdbId: 1,
            lastupdated: 1000000000,
            lastupdatedCheck: 1000000001
          },
          {
            id: 101,
            name: 'Show 101',
            tvdbId: 2,
            lastupdated: 1000000002,
            lastupdatedCheck: 1000000003
          },
          {
            id: 102,
            name: 'Show 102',
            tvdbId: 3,
            lastupdated: 1000000004,
            lastupdatedCheck: 1000000005
          },
          {
            id: 103,
            name: 'Show 103',
            tvdbId: 3,
            lastupdated: 1000000006,
            lastupdatedCheck: 1000000007
          }
        ]
      })
    })
}));

export class SNS {
  publish = publish;
}

export class Lambda {
  invoke = invoke;
}

export const config = {
  update() {}
};
