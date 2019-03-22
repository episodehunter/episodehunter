export const publish = jest.fn<any, any>(() => ({
  promise: () => Promise.resolve()
}));

export class SNS {
  publish = publish;
}
